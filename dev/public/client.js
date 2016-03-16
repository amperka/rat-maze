var doors = {};
var buttons = {};

var socket = io();

setInterval(function() {
  socket.emit('allDoors', '');
  console.log('allDoors');
  socket.on('allDoors', function(req_result) {
    doors = JSON.parse(req_result);
    for (var id in doors) {
      setState(buttons[id]);
    }
  });
}, 10000);

window.onload = function() {

  socket.emit('labirint_setup', '');
  socket.on('labirint_setup', function(reqResult) {

    doors = JSON.parse(reqResult);
    var controlButtons = document.getElementById('controlButtons');

    for (var index in doors) {
      var btn = document.createElement('button');
      btn.className = 'ctrlBtn';
      // debugger;
      btn.id = index;
      btn.onclick = function() {
        doorAction(this);
      };
      controlButtons.appendChild(btn);
    }

    var elements = controlButtons.getElementsByClassName('ctrlBtn');
    for (var i = 0; i < elements.length; ++i) {
      buttons[elements[i].id] = elements[i];
      setState(buttons[elements[i].id]);
    }
  });
};

function setState(el) {
  if (doors[el.id].st === 'o') {
    el.classList.add('ctrlBtn_opened');
    el.classList.remove('ctrlBtn_closed');
    el.textContent = 'O';
  } else {
    el.classList.add('ctrlBtn_closed');
    el.classList.remove('ctrlBtn_opened');
    el.textContent = 'X';
  }

  if (doors[el.id].cd > 0) {
    el.setAttribute('disabled', 'true');
  } else {
    el.removeAttribute('disabled');
  }
}

function doorAction(el) {
  socket.emit('door', JSON.stringify({id: el.id, s: doors[el.id].st}));
}

socket.on('door', function(msg) {
  var resp = JSON.parse(msg);
  doors[resp.id] = resp.data;
  setState(buttons[resp.id]);
});

function voteAction(action) {
  socket.emit('vote', JSON.stringify({action: action}));
}

socket.on('vote', function(msg) {
  var resp = JSON.parse(msg);
  console.log(resp);
  var action = resp.id;
  var state = resp.data;
  var timer = document.getElementById(action+'Timer');
  var button = document.getElementById(action+'Button');
  var timerCounter = state.cd;
  button.setAttribute('disabled', 'true');
  var tId = setInterval(function() {
    if (timerCounter-- === 0) {
      timer.innerHTML = '&nbsp;';
      clearInterval(tId);
      button.removeAttribute('disabled');
    } else {
      timer.innerHTML = timerCounter + ' сек.';
    }
  }, 1000);
});

function sendMessage() {
  var textEl = document.getElementById('message_input');
  var msg = textEl.value;
  textEl.value = '';
  if (msg !== '') {
    socket.emit('message_to_server', {message: msg});
  }
}

socket.on('message_to_client', function(data) {
  document.getElementById('chatlog').innerHTML = ('<hr/>' +
  data['message'] + document.getElementById('chatlog').innerHTML);
});
