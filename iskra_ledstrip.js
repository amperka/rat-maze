// Настраиваем соединение с Ethernet Shield 2
SPI2.setup({baud: 3200000, mosi: B15, miso: B14, sck: B13});
var eth = require('WIZnet').connect(SPI2, P10);
// подключаем библиотеку 'net' для работы с сетью Интернет
var net = require('net');

//Настраиваем управляемую диодную ленту
SPI1.setup({baud:3200000, mosi:P3, sck:A5, miso:P2});
//Резервируем память для управления 32 диодами
var arr = new Uint8ClampedArray(32*3);
// будем включать пугатель на scareCooldown миллисекунд
var scareCooldown = 3000;

// подключаем библиотеку 'servo' для работы с сервоприводами
var servo = require('@amperka/servo');

// создаем объект для хранения информации о 17 сервоприводах.
// servo - объект для работы с сервоприводом.
// state - текущее состояние двери ('o' - открыто, 'c' - закрыто)
// angle - угол сервопривода в данный момент
// min - минимальный угол сервопривода. Соответствует полностью закрытой двери
// max - максимальный угол сервопривода. Соответствует полностью открытой двери
var doors = {
  d1: {servo: servo.connect(A0), state: 'c', angle: 45, min: 6, max: 50},
  d2: {servo: servo.connect(A1), state: 'c', angle: 45, min: 19, max: 60},
  d3: {servo: servo.connect(A2), state: 'c', angle: 45, min: 5, max: 50},
  d4: {servo: servo.connect(A3), state: 'c', angle: 45, min: 17, max: 50},
  d5: {servo: servo.connect(P0), state: 'c', angle: 45, min: 20, max: 60},
  d7: {servo: servo.connect(P2), state: 'c', angle: 45, min: 0, max: 50},
  d9: {servo: servo.connect(P5), state: 'c', angle: 45, min: 19, max: 70},
  d10: {servo: servo.connect(P6), state: 'c', angle: 45, min: 10, max: 50},
  d11: {servo: servo.connect(P8), state: 'c', angle: 45, min: 1, max: 50},
  d12: {servo: servo.connect(P9), state: 'c', angle: 45, min: 0, max: 50},
  d13: {servo: servo.connect(P11), state: 'c', angle: 45, min: 5, max: 60},
  d14: {servo: servo.connect(P12), state: 'c', angle: 45, min: 5, max: 50},
  d15: {servo: servo.connect(P13), state: 'c', angle: 45, min: 20, max: 90},
  d16: {servo: servo.connect(SDA), state: 'c', angle: 45, min: 14, max: 75},
  d17: {servo: servo.connect(SCL), state: 'c', angle: 45, min: 4, max: 50}
};

// аналогично создаем объект для кормушки
var feed = {servo: servo.connect(P1), angle: 0, min: 9, max: 57, cd: 0};
// будем включать кормушку на feedCooldown миллисекунд
var feedCooldown = 10000;

// подключаем Ethernet Shield 2 к интерфейсу SPI2
eth.setIP();
// создаем сокет-соединение на указанный IP адрес сервера и порт
net.connect({host: '192.168.10.178', port: 1337}, function(socket) {
  // каждые 3000 миллисекунд посылаем запрос на обновление состояний дверей
  setInterval(function() {
    socket.write('Get');
  }, 3000);
  // обрабатываем получение данных от сервера
  socket.on('data', function(recieved) {
    // разворачиваем принятые данные в javascript объект
    var data = JSON.parse(recieved);
    if (data === undefined) {
      return;
    }
    var ptintOutAngle = [];                    // DELETE!!!
    // для каждой двери обновляем текущее состояние
    for (var door in data.doors) {
      doors[door].state = data.doors[door].st;
      ptintOutAngle.push(doors[door].angle); // DELETE!!!
    }
    console.log(ptintOutAngle);                 // DELETE!!!
    // если с сервера пришла команда открыть кормушку, активируем ее
    if (data.feed === 'o') {
      activateFeed();
    }
    // то же самое для накаливания обстановки
    if (data.scare === 'o') {
      activateScare();
    }
  });
  // обрабатываем отключение от сервера
  socket.on('close', function() {
    print('WARNING: connection closed');
  });
});

// каждые 100 миллисекунд обновляем состояние сервоприводов
setInterval(function() {
  for (var door in doors) {
    // если для сервопривода установлено состояние 'c' ("закрыто")
    if (doors[door].state === 'c') {
      // если дверь закрыта не полностью, уменьшаем угол сервопривода
      if (doors[door].angle > doors[door].min) {
        doors[door].angle -= 2;
      }
    }
    // если для сервопривода установлено состояние 'o' ("открыто")
    if (doors[door].state === 'o') {
      // если дверь открыта не полностью, увеличиваем угол сервопривода
      if (doors[door].angle < doors[door].max) {
        doors[door].angle += 5;
      }
    }
    // изменяем управляющий сигнал на сервопривод
    doors[door].servo.write(doors[door].angle);
  }
}, 100);

// активируем кормушку
function activateFeed() {
  // будем открывать кормушку только на feedCooldown миллисекунд
  feed.cd = feedCooldown;
  // а обновлять состояние кормушки каждые updatePeriod миллисекунд
  var updatePeriod = 100;
  // по аналогии с дверями лабиринта сделаем плавное открытие
  var timerID = setInterval(function() {
    // плавно открываем кормушку
    if (feed.cd > 0) {
      if (feed.angle > feed.min) {
        feed.angle -= 5;
      }
    } else {
      // если время истекло, плавно закрываем кормушку
      if (feed.angle < feed.max) {
        feed.angle += 2;
      } else {
        clearInterval(timerID);
      }
    }
    feed.servo.write(feed.angle);
    // с каждой итерацией feed.cd уменшается на updatePeriod
    feed.cd -= updatePeriod;
  }, updatePeriod);
}

// активируем пугатель
function activateScare() {
  var c = 0;
  // каждые 100 миллисекунд обновляем цвет ленты
  var timerID = setInterval(function () {
    c++;
    // пиксели окрашиваем в красный цвет в помощью функции синуса
    for (var p = 0; p < arr.length; p += 3) {
      arr[p  ] = 0;
      arr[p+1] = (1 + Math.sin(c*2) ) * 126;
      arr[p+2] = 0;
    }
    // записываем в ленту новые значения цветов
    SPI1.send4bit(arr, 0b0001, 0b0011);
  }, 100);

  // устанавливаем время мерцания ленты scareCooldown миллисекунд
  setTimeout(function () {
    // по истечению этого времени останавливаем таймер мерцания
    clearInterval(timerID);
    // каждый пиксель зажигаем белым светом
    for (var i = 0; i < arr.length; i += 3) {
      arr[i  ] = 100;
      arr[i+1] = 100;
      arr[i+2] = 100;
    }
    SPI1.send4bit(arr, 0b0001, 0b0011);
  }, scareCooldown);
}
