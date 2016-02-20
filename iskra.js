SPI2.setup({baud:3200000, mosi:P4, miso: P7, sck: P1});

//SPI2.setup({baud:3200000, mosi:B15});
var arr = new Uint8ClampedArray(25*3);
var pos = 0;

function getPattern() {
  pos++;
  for (var i=0;i<arr.length;i+=3) {
    arr[i  ] = (1 + Math.sin((i+pos)*0.1324)) * 127;
    arr[i+1] = (1 + Math.sin((i+pos)*0.1654)) * 127;
    arr[i+2] = (1 + Math.sin((i+pos)*0.1)) * 127;
  }
}

function onTimer() {
  getPattern();
  SPI2.send4bit(arr, 0b0001, 0b0011); 
}

setInterval(onTimer, 50);