var doors = {};
var buttons = {};

var socket = io();

setInterval(function () {
	socket.emit('allDoors', '');
	console.log('allDoors');
	socket.on('allDoors', function (req_result) {
		doors = JSON.parse(req_result);
		for(id in doors) {
			setState(buttons[id]);
		}
	});
}, 10000);

window.onload = function () {

	sendButton = document.getElementById('send');

	socket.emit('labirint_setup', '');
	socket.on('labirint_setup', function (req_result) {

		doors = JSON.parse(req_result);

		for(var index in doors) { 
			var btn = document.createElement('button');
			btn.className = 'ctrlBtn';
			//debugger;
			btn.id = index;
			btn.onclick = function () {
				doorAction(this);
			};
			controlButtons.appendChild(btn);
		}

		var elements = controlButtons.getElementsByClassName('ctrlBtn');
		for(var i = 0; i < elements.length; ++i) {
			buttons[elements[i].id] = elements[i];

			setState(buttons[elements[i].id]);
		}
	});
}

function setState(el) {
	if(doors[el.id].st == 'o')
	{
		el.classList.add('ctrlBtn_opened');
		el.classList.remove('ctrlBtn_closed');
		el.textContent = 'O';
	} else {
		el.classList.add('ctrlBtn_closed');
		el.classList.remove('ctrlBtn_opened');
		el.textContent = 'X';
	}

	if(doors[el.id].cd > 0) {
		//el.classList.add('ctrlBtn_busy');
		el.setAttribute('disabled', 'true');
	} else {
		//el.classList.remove('ctrlBtn_busy');
		el.removeAttribute('disabled');
	}		
}

function doorAction(el) {
	socket.emit('door', JSON.stringify({
		id : el.id,
		s : doors[el.id].st
	}));
}

socket.on('door', function (msg) {
	var resp = JSON.parse(msg);
	doors[resp.id] = resp.data;
	setState(buttons[resp.id]);
});

function sendMessage() {
	var textEl = document.getElementById("message_input");
	var msg = textEl.value;
	textEl.value = '';
	if(msg != '') {
		socket.emit("message_to_server", { message : msg});
	}
}

socket.on("message_to_client", function (data) {
	document.getElementById("chatlog").innerHTML = ("<hr/>" +
	data['message'] + document.getElementById("chatlog").innerHTML);
});