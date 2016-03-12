
//Настраиваем SPI2 интерфейс на Iskra JS
SPI2.setup({ mosi:B15, miso:B14, sck:B13 });
//подключаем библиотеку 'servo' для работы с сервоприводами
var servo = require('servo');

//Настраиваем управляемую диодную ленту
SPI1.setup({baud:3200000, mosi:P3, sck:A5, miso:P2});
//Резервируем память для управления 25 диодами
var arr = new Uint8ClampedArray(32*3);
//заводим счетчик для радуги из цветных диодов
var pos = 0;
//задаем закон изменения цвета
function getPattern() {
  //увеличиваем счетчик на единицу
  ++pos;
  //для каждого цвета каждого диода устанавливаем цвет
  for (var i = 0; i < arr.length; i += 3) {
    arr[i  ] = ( 1 + Math.sin( (i+pos)*0.1324 ) ) * 127;
    arr[i+1] = ( 1 + Math.sin( (i+pos)*0.1654 ) ) * 127;
    arr[i+2] = ( 1 + Math.sin( (i+pos)*0.1    ) ) * 127;
  }
}
//каждые 50 миллисекунд обновляем цвет ленты
setInterval(function () {
  //вызываем функцию обновления цвета
  getPattern();
  //обновляем состояние ленты
  SPI1.send4bit(arr, 0b0001, 0b0011);
}, 50);

//угол сервоприводов по умолчанию
var defaultAngle = 0;

//создаем объект для хранения информации о 17 сервоприводах.
//servo - объект для работы с сервоприводом.
//Значением undefined резервируем место в объекте
//state - текущее состояние двери ('o' - открыто, 'c' - закрыто) 
//angle - угол сервопривода в данный момент
//min - минимальный угол сервопривода. Соответствует полностью закрытой двери
//max - максимальный угол сервопривода. Соответствует полностью открытой двери
var doors = {
  d1 : {servo: undefined, state: 'c', angle: defaultAngle, min: 6, max: 50},
  d2 : {servo: undefined, state: 'c', angle: defaultAngle, min: 19, max: 60},
  d3 : {servo: undefined, state: 'c', angle: defaultAngle, min: 5, max: 50},
  d4 : {servo: undefined, state: 'c', angle: defaultAngle, min: 17, max: 50},
  d5 : {servo: undefined, state: 'c', angle: defaultAngle, min: 10, max: 60},
  d6 : {servo: undefined, state: 'c', angle: defaultAngle, min: 9, max: 50},
  d7 : {servo: undefined, state: 'c', angle: defaultAngle, min: 0, max: 50},
  d8 : {servo: undefined, state: 'c', angle: defaultAngle, min: 9, max: 50},
  d9 : {servo: undefined, state: 'c', angle: defaultAngle, min: 19, max: 70},
  d10 : {servo: undefined, state: 'c', angle: defaultAngle, min: 10, max: 50},
  d11 : {servo: undefined, state: 'c', angle: defaultAngle, min: 1, max: 50},
  d12 : {servo: undefined, state: 'c', angle: defaultAngle, min: 0, max: 50},
  d13 : {servo: undefined, state: 'c', angle: defaultAngle, min: 5, max: 60},
  d14 : {servo: undefined, state: 'c', angle: defaultAngle, min: 5, max: 50},
  d15 : {servo: undefined, state: 'c', angle: defaultAngle, min: 30, max: 90},
  d16 : {servo: undefined, state: 'c', angle: defaultAngle, min: 14, max: 75},
  d17 : {servo: undefined, state: 'c', angle: defaultAngle, min: 4, max: 50}
};

//объект в котором хранятся нормера пинов на плате для сервоприводов
var pins = {
  d1 : A0, d2 : A1, d3 : A2, d4 : A3, d5 : P0,
  d6 : P1, d7 : A11, d8 : A9, d9 : P5, d10 : P6,
  d11 : P8, d12 : P9, d13 : P11, d14 : P12,
  d15 : P13, d16 : SDA, d17 : SCL
};

//подключаем каждый сервопривод к своему объекту хранения
for(var pin in pins) {
  doors[pin].servo = servo.connect(pins[pin]);
}
//создаем объект для управления кормушкой
//var feeder = new Pin(P4);
//создаем объект для обработки кнопки
//var feederActivator = new Pin(P7);

//каждые 100 миллисекунд обновляем состояние сервоприводов и опрашиваем кнопки
setInterval( function () {
  //обрабатываем состояние сервоприводов
  //для каждой двери в массиве
  for(var door in doors) {
    //узнаем состояние, которое установили пользователи
    //если установлено состояние 'o' ("открыто")
    if(doors[door].state === 'o') {
      //если дверь открыта не полностью (угол сервопривода больше, чем нужно)
      if(doors[door].angle > doors[door].min) {
        //уменьшаем угол сервопривода
        doors[door].angle -= 2;
      }
    }
    //если установлено состояние 'с' ("закрыто")
    if(doors[door].state === 'c') {
      //если дверь закрыта не полностью (угол сервопривода меньше, чем нужно)
      if(doors[door].angle < doors[door].max) {
        //увеличиваем угол сервопривода
        doors[door].angle += 5;
      }
    }
    //изменяем управляющий сигнал на сервопривод
    doors[door].servo.write(doors[door].angle);
  }
  //Обрабатываем состояние кнопок
  //если нажата кнопка
  //if(feederActivator.read() === 1) {
  //  //включаем кормушку на 1500 миллисекунд
  //  feeder.writeAtTime(1, 1500);
  //}
}, 100);

setInterval( function () {
  console.log('timer 1 second');
}, 1000);