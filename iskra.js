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

function ledStateChange()
{
	getLedPattern();
	SPI2.send4bit(arr, 0b0001, 0b0011); 
}

/* LED strip control END*/

/* Servo setup */

var doors = {
	d1 : '',
	d2 : '',
	d3 : '',
	d4 : '',
	d5 : '',
	d6 : '',
	d7 : '',
	d8 : '',
	d9 : '',
	d10 : '',
	d11 : '',
	d12 : '',
	d13 : '',
	d14 : '',
	d15 : '',
	d16 : '',
	d17 : '',
	d18 : ''
};

/* Servo setup END */

/* Servo control via MultiServo Shield*/

/*I2C1.setup({sda: SDA, scl: SCL, bitrate: 100000});
var multiServo = require('MultiServo').connect(I2C1);

var i = 0;
for(var servo in doors)
{
  doors[servo] = multiServo.attach(i++);
}*/

var singleServo = require('@amperka/servo').connect(P2);
//doors.d2 = require('ServoHW').connect(P2);
//doors.d2.write(0);

var position = 0;

function step()
{
  position++;
  if(position == 256) position = 0;
  //for(var servo in doors)
  //{
    singleServo.write(position);
  //}
}

setInterval(step, 50);



/* Servo control via MultiServo Shield END*/

/* Servo control via single pin */

//var singleServo = require('ServoHW').connect(P2);
//doors.d2 = require('ServoHW').connect(P2);
//doors.d2.write(0);

/* Servo control via single pin END */

/* Activities */

/*setInterval(ledStateChange, 50);

var feederLocked = true;

setInterval(function ()
            {
              doors.d2.write(100);
              setTimeout(function ()
                  {
                    doors.d2.write(30);
                  }, 200);
              }, 2000);

setInterval(function ()
	{
		//doors.d1.write(   Math.floor(Math.random() * (255 - 0)) + 0    );
	}, 900);*/

/* Activities END */







