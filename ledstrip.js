
//Настраиваем управляемую диодную ленту
SPI1.setup({baud:3200000, mosi:P3, sck:A5, miso:P2});
//Резервируем память для управления 25 диодами
var arr = new Uint8ClampedArray(20*3);

// аналогично создаем объекты для кормушки и пугателя
var scareCooldown = 3000;

// Настраиваем соединение с Ethernet Shield 2
SPI2.setup({baud: 3200000, mosi: B15, miso: B14, sck: B13});
var eth = require('WIZnet').connect(SPI2, P10);
// подключаем библиотеку 'net' для работы с сетью Интернет
var net = require('net');
// подключаем Ethernet Shield 2 к интерфейсу SPI2
eth.setIP();
// создаем сокет-соединение на указанный IP адрес сервера и порт
net.connect({host: '192.168.10.178', port: 1337}, function(socket) {
  // каждые 3000 миллисекунд посылаем запрос на обновление состояний дверей
  setInterval(function() {
    socket.write('Scare');
  }, 5000);
  // обрабатываем получение данных от сервера
  socket.on('data', function(recieved) {
    // разворачиваем принятые данные в javascript объект
    var data = JSON.parse(recieved);
    if (data === undefined) {
      return;
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

// активируем пугатель
function activateScare() {
  console.log('activateScare');
  var c = 0;
  // каждые 50 миллисекунд обновляем цвет ленты
  var timerID = setInterval(function () {
    c++;
    for (var p = 0; p < arr.length; p += 3) {
      arr[p  ] = (1 + Math.sin(c*2) ) * 126;
      arr[p+1] = 0;
      arr[p+2] = 0;
    }
    // обновляем состояние ленты
    SPI1.send4bit(arr, 0b0001, 0b0011);
  }, 100);

  setTimeout(function () {
    clearInterval(timerID);
    for (var i = 0; i < arr.length; i += 3) {
      arr[i  ] = 100;
      arr[i+1] = 100;
      arr[i+2] = 100;
    }
    SPI1.send4bit(arr, 0b0001, 0b0011);
    console.log('deactivateScare');
  }, scareCooldown);
}
