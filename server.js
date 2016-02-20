
/*
	each time you see 'o' or 'c' that means:
		o - open/opened
		c - close/closed
*/


var http = require('http');
var url = require('url');
var querystring = require('querystring');
var static = require('node-static');
var file = new static.Server('.');


var COOLDOWN_SECONDS = 10;

var doors = {
		d1 : {state : 'o', cooldown : 0},
		d2 : {state : 'o', cooldown : 0},
		d3 : {state : 'o', cooldown : 0},
		d4 : {state : 'o', cooldown : 0},
		d5 : {state : 'o', cooldown : 0},
		d6 : {state : 'o', cooldown : 0},
		d7 : {state : 'o', cooldown : 0},
		d8 : {state : 'o', cooldown : 0},
		d9 : {state : 'o', cooldown : 0},
		d10 : {state : 'o', cooldown : 0},
		d11 : {state : 'o', cooldown : 0},
		d12 : {state : 'o', cooldown : 0},
		d13 : {state : 'o', cooldown : 0},
		d14 : {state : 'o', cooldown : 0}
};

setInterval(function()
{
	for(i in doors)
	{
		doors[i].cooldown -= 1;
	}
}, 1000);

function toggle(number)
{
	if(doors[number].cooldown <= 0)
	{
		if(doors[number].state == 'o')
		{
			doors[number].state = 'c'; 
		} else {
			doors[number].state = 'o';
		}
		doors[number].cooldown = COOLDOWN_SECONDS;
	}
}

function accept(req, res) {

	var urlParams = url.parse(req.url);

	var path = urlParams.pathname;
	var query = querystring.parse(urlParams.query);

	//console.log(query);
	//console.log('request: ' + path);

	var response = '';
	var pathFound = true;

	switch(path)
	{
		case '/door': 
		{
			toggle(query.id);
			response = JSON.stringify(doors[query.id]);
		}; break;
		case '/allDoors': 
		{
			response = JSON.stringify(doors);
		}; break;
		default: pathFound = false;
	}

	if(pathFound)
	{
		res.end(response);
	}else{
		file.serve(req, res);
	}	

}

if (!module.parent)
{
	http.createServer(accept).listen(8080);
	console.log('HTTP Server listening');
} else {
	exports.accept = accept;
}




// UDP server for Iskra JS

var PORT = 11111;
var HOST = '0.0.0.0';

var dgram = require('dgram');
var server = dgram.createSocket('udp4');

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
    console.log(remote.address + ':' + remote.port +' - ' + message);
    var m = "" + message;
    var c = m.charCodeAt(0);
    console.log(c);
	server.send(message, 0, message.length-1, remote.port, remote.address);
});

server.bind(PORT, HOST);