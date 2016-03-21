
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
// var path = require('path');

var buttonStatisticFile = '/button_statistic.json';
var buttonClicked = {feed: 0, scare: 0};

var HTTP_PORT = 3002;
var UDP_PORT = 3003;

var COOLDOWN_SECONDS = 3;
var VOTE_COOLDOWN_SECONDS = 20;

console.log(__dirname);
console.log(process.cwd());

/*
  o - open/opened
  c - close/closed
  st - state
  cd - cd
*/
var doors = {
  d1: {st: 'o', cd: 0, text: '1'},
  d2: {st: 'o', cd: 0, text: '2'},
  d3: {st: 'o', cd: 0, text: '3'},
  d4: {st: 'o', cd: 0, text: '4'},
  d5: {st: 'o', cd: 0, text: '5'},
  d7: {st: 'o', cd: 0, text: '6'},
  d9: {st: 'o', cd: 0, text: '7'},
  d10: {st: 'o', cd: 0, text: '8'},
  d11: {st: 'o', cd: 0, text: '9'},
  d12: {st: 'o', cd: 0, text: '10'},
  d13: {st: 'o', cd: 0, text: '11'},
  d14: {st: 'o', cd: 0, text: '12'},
  d15: {st: 'o', cd: 0, text: '13'},
  d16: {st: 'o', cd: 0, text: '14'},
  d17: {st: 'o', cd: 0, text: '15'}
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
      // console.log('vote['+i+'] ready!');
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

// app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/', express.static(__dirname+'/public'));

io.on('connection', function(socket) {

  // console.log('new connection: ' + socket.id);
  var user = socket.id;

  socket.on('labirint_setup', function() {
    // console.log('labirint_setup: ' + msg);
    io.sockets.connected[user].emit('labirint_setup',
      JSON.stringify(doors));
  });

  socket.on('allDoors', function() {
    io.sockets.connected[user].emit('allDoors', JSON.stringify(doors));
  });

  socket.on('disconnect', function(){
    // console.log('user ' + user + ' disconnected');
  });

  socket.on('door', function(msg) {
    // console.log('door: ' + msg);
    var req = JSON.parse(msg);
    var id = req.id;
    var state = req.s;
    var status = doorAction(id, state);
    io.emit('door', JSON.stringify({id: id, data: doors[id]}));
  });

  socket.on('vote', function(msg) {
    // console.log('vote: ' + msg);
    var req = JSON.parse(msg);
    var action = req.action;
    if (vote[action] !== undefined) {
      buttonClicked[action] += 1;
      var status = voteAction(action);
      if (status !== undefined) {
        // console.log(status);
      } else {
        io.sockets.connected[user].emit('vote', JSON.stringify({
          id: action,
          data: vote[action]
        }));
        io.emit('vote', JSON.stringify({id: action, data: vote[action]}));
      }
    }
  });

});

http.listen(HTTP_PORT, function() {
});

// UDP server
var iskraServer = require('net').createServer(function(socket) {
  socket.on('data', function(data) {

    var sendDoors = {};
    for (var id in doors) {
      sendDoors[id] = doors[id].st;
    }
    socket.write(JSON.stringify({
      feed: vote.feed.st,
      scare: vote.scare.st,
      doors: sendDoors
    }));
    vote.feed.st = 'c';
    vote.scare.st = 'c';

  });

});
iskraServer.listen(UDP_PORT, '0.0.0.0');

// read and write file with vote statistics
fs.readFile(__dirname + buttonStatisticFile, 'utf8', function(err, data) {
  if (err) {
    // console.log(err);
    fs.writeFile(__dirname + buttonStatisticFile, JSON.stringify(buttonClicked),
      function(err) {
        console.log(err);
        return;
      });
  }
  console.log('read clicked buttons statistic: ', data);
  if (data != null) {
    buttonClicked = JSON.parse(data);
  }
  setInterval(function() {
    fs.writeFile(__dirname + buttonStatisticFile, JSON.stringify(buttonClicked),
      function(err) {
        if (err) {
          console.log(err);
          return;
        }
        // console.log('save clicked buttons statistic: ', buttonClicked);
      });
  }, 60000);
});
