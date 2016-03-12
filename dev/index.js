/*
	o - open/opened
	c - close/closed
	st - state
	cd - cd
*/

var HTTP_PORT = 3000;
var UDP_PORT = 1337;
var COOLDOWN_SECONDS = 3;

var doors = {
	d1 : {st : 'o', cd : 0},
	d2 : {st : 'o', cd : 0},
	d3 : {st : 'o', cd : 0},
	d4 : {st : 'o', cd : 0},
	d5 : {st : 'o', cd : 0},
	//d6 : {st : 'o', cd : 0},
	d7 : {st : 'o', cd : 0},
	d8 : {st : 'o', cd : 0},
	d9 : {st : 'o', cd : 0},
	d10 : {st : 'o', cd : 0},
	d11 : {st : 'o', cd : 0},
	d12 : {st : 'o', cd : 0},
	d13 : {st : 'o', cd : 0},
	d14 : {st : 'o', cd : 0},
	d15 : {st : 'o', cd : 0},
	d16 : {st : 'o', cd : 0},
	d17 : {st : 'o', cd : 0}
};

setInterval(function () {
	for(i in doors) {
		if(0 == --doors[i].cd) {
			io.emit('door', JSON.stringify({ id: i, data: doors[i]}));
		}
	}
}, 1000);

function doorAction(number, state)
{
	if(doors[number].cd <= 0) {
		var stateChanged = false;
		switch(state) {
			case 'o': doors[number].st = 'c'; stateChanged = true; break;
			case 'c': doors[number].st = 'o'; stateChanged = true; break;
			default: return 'illegal request'; break;
		}
		if(stateChanged) {
			doors[number].cd = COOLDOWN_SECONDS;
		}
	}
}

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sanitize = require('validator').sanitize;

app.use('/', express.static('public'));

io.on('connection', function (socket) {

	console.log('new connection: ' + socket.id);
	var user = socket.id;

	socket.on('labirint_setup', function (msg) {
		console.log('labirint_setup: ' + msg);
		io.sockets.connected[user].emit('labirint_setup', JSON.stringify(doors));
	});

	socket.on('allDoors', function (msg) {
		//console.log('allDoors: ' + msg);
		io.sockets.connected[user].emit('allDoors', JSON.stringify(doors));
	});

	socket.on('disconnect', function (){
		console.log('user ' + user + ' disconnected');
	});

	socket.on('door', function (msg) {
		console.log('door: ' + msg);
		var req = JSON.parse(msg);
		var id = req.id;
		var state = req.s;
		//console.log('doorAction: ');
		var status = doorAction(id, state);
		if(status !== undefined) console.log(status);
		io.emit('door', JSON.stringify({ id: id, data: doors[id]}));
	});

	socket.on('message_to_server', function (data) {
		io.sockets.emit("message_to_client", { message: data["message"] });
	});

});

http.listen(HTTP_PORT, function () {
	console.log('listening on: ' + HTTP_PORT);
});

var iskraServer = require("net").createServer(function (socket) {
	socket.on('data', function (data) {
		console.log('Server received: ' + data)
		socket.write(JSON.stringify(doors));
	});
	//socket.write(JSON.stringify(servos));
	socket.pipe(socket);
});
iskraServer.listen(UDP_PORT, '0.0.0.0');






/*// UDP server for Iskra JS

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

server.bind(PORT, HOST);*/