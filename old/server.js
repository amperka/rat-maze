
var http = require('http');

// Подключаем модуль и ставим на прослушивание 8080-порта - 80й обычно занят под http-сервер
var io = require('socket.io')(http); 
// Отключаем вывод полного лога - пригодится в production'е
//io.set('log level', 1);
// Навешиваем обработчик на подключение нового клиента
io.sockets.on('connection', function (socket) {
	// Т.к. чат простой - в качестве ников пока используем первые 5 символов от ID сокета
	var ID = (socket.id).toString().substr(0, 5);
	var time = (new Date).toLocaleTimeString();
	// Посылаем клиенту сообщение о том, что он успешно подключился и его имя
	socket.json.send({'event': 'connected', 'name': ID, 'time': time});
	// Посылаем всем остальным пользователям, что подключился новый клиент и его имя
	socket.broadcast.json.send({'event': 'userJoined', 'name': ID, 'time': time});
	// Навешиваем обработчик на входящее сообщение
	socket.on('message', function (msg) {
		var time = (new Date).toLocaleTimeString();
		// Уведомляем клиента, что его сообщение успешно дошло до сервера
		socket.json.send({'event': 'messageSent', 'name': ID, 'text': msg, 'time': time});
		// Отсылаем сообщение остальным участникам чата
		socket.broadcast.json.send({'event': 'messageReceived', 'name': ID, 'text': msg, 'time': time})
	});
	// При отключении клиента - уведомляем остальных
	socket.on('disconnect', function() {
		var time = (new Date).toLocaleTimeString();
		io.sockets.json.send({'event': 'userSplit', 'name': ID, 'time': time});
	});
});



/*
	each time you see 'o' or 'c' that means:
		o - open/opened
		c - close/closed
*/

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

var doorBusy = false;

function toggle(number)
{
	if(!doorBusy){
		doorBusy = true;
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
	doorBusy = false;
}

function doorAction(number, state)
{
	if(!doorBusy){
		doorBusy = true;
		if(doors[number].cooldown <= 0)
		{
			if(state == 'o')
			{
				doors[number].state = 'c'; 
			}
			if(state == 'c')
			{
				doors[number].state = 'o'; 
			}
			doors[number].cooldown = COOLDOWN_SECONDS;
		}
	}
	doorBusy = false;
}

function accept(req, res) {

	var urlParams = url.parse(req.url);

	var path = urlParams.pathname;
	var query = querystring.parse(urlParams.query);

	console.log(query);
	//console.log('request: ' + path);

	var response = '';
	var pathFound = true;

	switch(path)
	{
		case '/door': 
		{
			var id = query.id;
			var state = query.s;
			//console.log(query);
			//if(id !== undefined && state !== undefined)
			//{
				//doorAction(id, state);
				//console.log("door action");
				toggle(id);
				response = JSON.stringify(doors[id]);
			//}
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
	http.createServer(accept).listen(8081);
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