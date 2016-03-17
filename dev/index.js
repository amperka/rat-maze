
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

var buttonStatisticFile = 'button_statistic.json';
var buttonClicked = {feed: 0, scare: 0};

var HTTP_PORT = 3000;
var UDP_PORT = 1337;

var COOLDOWN_SECONDS = 3;
var VOTE_COOLDOWN_SECONDS = 20;

/*
  o - open/opened
  c - close/closed
  st - state
  cd - cd
*/
var doors = {
  d1: {st: 'o', cd: 0},
  d2: {st: 'o', cd: 0},
  d3: {st: 'o', cd: 0},
  d4: {st: 'o', cd: 0},
  d5: {st: 'o', cd: 0},
  d7: {st: 'o', cd: 0},
  d8: {st: 'o', cd: 0},
  d9: {st: 'o', cd: 0},
  d10: {st: 'o', cd: 0},
  d11: {st: 'o', cd: 0},
  d12: {st: 'o', cd: 0},
  d13: {st: 'o', cd: 0},
  d14: {st: 'o', cd: 0},
  d15: {st: 'o', cd: 0},
  d16: {st: 'o', cd: 0},
  d17: {st: 'o', cd: 0}
};

var vote = {
  feed: {st: 'o', cd: 0},
  scare: {st: 'o', cd: 0}
};

// reduce cooldown timeout
setInterval(function() {
  var i;
  for (i in doors) {
    if (--doors[i].cd === 0) {
      io.emit('door', JSON.stringify({id: i, data: doors[i]}));
    }
  }
  for (i in vote) {
    if (--vote[i].cd === 0) {
      console.log('vote['+i+'] ready!');
      vote[i].st = 'c';
      io.emit('vote', JSON.stringify({id: i, data: vote[i]}));
    }
  }
}, 1000);

function doorAction(number, state) {
  if (doors[number].cd <= 0) {
    switch (state) {
      case 'o': {
        doors[number].st = 'c';
        doors[number].cd = COOLDOWN_SECONDS;
      } break;
      case 'c': {
        doors[number].st = 'o';
        doors[number].cd = COOLDOWN_SECONDS;
      } break;
      default: return 'illegal request';
    }
  } else {
    return 'cooldown is greater then zero';
  }
}

function voteAction(action) {
  if (vote[action].cd <= 0) {
    vote[action].st = 'o';
    vote[action].cd = VOTE_COOLDOWN_SECONDS;
  } else {
    return 'cooldown is greater then zero';
  }
}

app.use('/', express.static('public'));

io.on('connection', function(socket) {

  console.log('new connection: ' + socket.id);
  var user = socket.id;

  socket.on('labirint_setup', function(msg) {
    console.log('labirint_setup: ' + msg);
    io.sockets.connected[user].emit('labirint_setup', JSON.stringify(doors));
  });

  socket.on('allDoors', function(msg) {
    io.sockets.connected[user].emit('allDoors', JSON.stringify(doors));
  });

  socket.on('disconnect', function(){
    console.log('user ' + user + ' disconnected');
  });

  socket.on('door', function(msg) {
    console.log('door: ' + msg);
    var req = JSON.parse(msg);
    var id = req.id;
    var state = req.s;
    var status = doorAction(id, state);
    if (status !== undefined) {
      console.log(status);
    }
    io.emit('door', JSON.stringify({id: id, data: doors[id]}));
  });

  socket.on('vote', function(msg) {
    console.log('vote: ' + msg);
    var req = JSON.parse(msg);
    var action = req.action;
    if (vote[action] !== undefined) {
      buttonClicked[action] += 1;
      var status = voteAction(action);
      if (status !== undefined) {
        console.log(status);
      } else {
        io.sockets.connected[user].emit('vote', JSON.stringify({
          id: action,
          data: vote[action]
        }));
        io.emit('vote', JSON.stringify({id: action, data: vote[action]}));
      }
    }
  });

  socket.on('message_to_server', function(data) {
    io.sockets.emit('message_to_client', {message: data['message']});
  });

});

http.listen(HTTP_PORT, function() {
  console.log('listening on: ' + HTTP_PORT);
});

// UDP server
var iskraServer = require("net").createServer(function(socket) {
  socket.on('data', function(data) {
    console.log('Server received: ' + data);
    socket.write(JSON.stringify({
      feed: vote.feed.st,
      scare: vote.scare.st,
      doors: doors
    }));
    vote.feed.st = 'c';
    vote.scare.st = 'c';
    console.log('votes commands sent to Iskra.JS and reset');
  });
  // socket.write(JSON.stringify(servos));
  socket.pipe(socket);
});
iskraServer.listen(UDP_PORT, '0.0.0.0');

// read and write file with vote statistics
fs.readFile(buttonStatisticFile, 'utf8', function(err, data) {
  if (err) {
    console.log(err);
    fs.writeFile('button_statistic.json', JSON.stringify(buttonClicked),
      function(err) {
        return console.log(err);
      });
  }
  console.log('read clicked buttons statistic: ', data);
  buttonClicked = JSON.parse(data);
  setInterval(function() {
    fs.writeFile(buttonStatisticFile, JSON.stringify(buttonClicked),
      function(err) {
        if (err) {
          return console.log(err);
        }
        console.log('save clicked buttons statistic: ', buttonClicked);
      });
  }, 60000);
});
