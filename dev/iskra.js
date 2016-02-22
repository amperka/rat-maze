/* LED strip control */

SPI2.setup({
	baud: 3200000,
	mosi: P4,
	miso: P7,
	sck: P1
});

var LED_NUMBER = 25;
var LED_COLORS = 3;

var arr = new Uint8ClampedArray(LED_NUMBER * LED_COLORS);
var pos = 0;

function getLedPattern()
{
	pos++;
	for (var i = 0; i < arr.length; i += LED_COLORS)
	{
		arr[i  ] = (1 + Math.sin((i+pos)*0.1324)) * 127;
		arr[i+1] = (1 + Math.sin((i+pos)*0.1654)) * 127;
		arr[i+2] = (1 + Math.sin((i+pos)*0.1)) * 127;
	}
}

// function ledStateChange()
// {
// 	getLedPattern();
// 	SPI2.send4bit(arr, 0b0001, 0b0011); 
// }

/* LED strip control END*/

/* Servo setup */

var doors = {
	d1 : '',
	d2 : '',
	d3 : ''
};

/* Servo setup END */

/* Servo control via MultiServo Shield*/

I2C1.setup({sda: SDA, scl: SCL, bitrate: 100000});
var multiServo = require('MultiServo').connect(I2C1);
doors.d1 = multiServo.attach(0);
doors.d1.write(128);

/* Servo control via MultiServo Shield END*/

/* Servo control via single pin */

var singleServo = require('ServoHW');
doors.d2.connect(P2);
doors.d2.write(0);

/* Servo control via single pin END */


/* Activities */

setInterval(ledStateChange, 50);

setInterval(function ()
	{
		doors.d2.write(   Math.floor(Math.random() * (255 - 0)) + 0    );
	}, 800);

setInterval(function ()
	{
		doors.d1.write(   Math.floor(Math.random() * (255 - 0)) + 0    );
	}, 900);

/* Activities END */