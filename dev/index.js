/*
	o - open/opened
	c - close/closed
	st - state
	cd - cd
*/

var button_statistic_file = 'button_statistic.json';

var HTTP_PORT = 3000;
var UDP_PORT = 1337;
var COOLDOWN_SECONDS = 3;
var VOTE_COOLDOWN_SECONDS = 10;

var buttonClicked = {feed:0, scare:0};

var doors = {
	d1 : {st : 'o', cd : 0},
	d2 : {st : 'o', cd : 0},
	d3 : {st : 'o', cd : 0},
	d4 : {st : 'o', cd : 0},
	d5 : {st : 'o', cd : 0},
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

var vote = {
	feed : {st : 'o', cd : 0},
	scare : {st : 'o', cd : 0}
};

setInterval(function () {
	for(i in doors) {
		if(0 == --doors[i].cd) {
			io.emit('door', JSON.stringify({ id: i, data: doors[i]}));
		}
	}
	for(i in vote) {
		if(0 == --vote[i].cd) {
			console.log('vote['+i+'] ready!');
			vote[i].st = 'o';
			io.emit('vote', JSON.stringify({ id: i, data: vote[i]}));
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

function voteAction(action)
{
	if(vote[action].cd <= 0) {
		vote[action].st = 'c';
		vote[action].cd = VOTE_COOLDOWN_SECONDS;
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
		var status = doorAction(id, state);
		if(status !== undefined) console.log(status);
		io.emit('door', JSON.stringify({ id: id, data: doors[id]}));
	});

	socket.on('vote', function (msg) {
		console.log('vote: ' + msg);
		var req = JSON.parse(msg);
		var action = req.action;
		if(action === 'feed' || action === 'scare') {
			buttonClicked[action] += 1;
			var status = voteAction(action);
			if(status !== undefined) console.log(status);
			//io.sockets.connected[user].emit('vote', JSON.stringify({ id: action, data: vote[action]}));
			io.emit('vote', JSON.stringify({ id: action, data: vote[action]}));
		}
	});

	socket.on('message_to_server', function (data) {
		io.sockets.emit("message_to_client", { message: data["message"] });
	});

});

http.listen(HTTP_PORT, function () {
	console.log('listening on: ' + HTTP_PORT);
});

//UDP server
var iskraServer = require("net").createServer(function (socket) {
	socket.on('data', function (data) {
		console.log('Server received: ' + data)
		socket.write(JSON.stringify(doors));
	});
	//socket.write(JSON.stringify(servos));
	socket.pipe(socket);
});
iskraServer.listen(UDP_PORT, '0.0.0.0');

//read and write file with vote statistics
fs = require('fs');
fs.readFile(button_statistic_file, 'utf8', function (err, data) {
	if (err) {
		console.log(err);
		fs.writeFile('button_statistic.json', JSON.stringify(buttonClicked), function (err) {
			return console.log(err);
		});
	}
	console.log('read clicked buttons statistic: ', data);
	buttonClicked = JSON.parse(data);
	setInterval( function () {
		fs.writeFile(button_statistic_file, JSON.stringify(buttonClicked), function (err) {
			if (err) return console.log(err);
			console.log('save clicked buttons statistic: ', buttonClicked);
		});
	}, 10000);
});