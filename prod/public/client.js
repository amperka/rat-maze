function setState(a){"o"===doors[a.id].st?(a.classList.add("ctrlBtn_opened"),a.classList.remove("ctrlBtn_closed")):(a.classList.add("ctrlBtn_closed"),a.classList.remove("ctrlBtn_opened")),doors[a.id].cd>0?a.setAttribute("disabled","true"):a.removeAttribute("disabled")}function doorAction(a){socket.emit("door",JSON.stringify({id:a.id,s:doors[a.id].st}))}function voteAction(a){socket.emit("vote",JSON.stringify({action:a}))}var doors={},buttons={},socket=io();setInterval(function(){socket.emit("allDoors",""),console.log("allDoors"),socket.on("allDoors",function(a){doors=JSON.parse(a);for(var b in doors)setState(buttons[b])})},1e4),window.onload=function(){socket.emit("labirint_setup",""),socket.on("labirint_setup",function(a){doors=JSON.parse(a);var b=document.getElementById("controlButtons");for(var c in doors){var d=document.createElement("button");d.className="ctrlBtn",d.id=c,d.onclick=function(){doorAction(this)},d.textContent=doors[c].text,b.appendChild(d)}for(var e=b.getElementsByClassName("ctrlBtn"),f=0;f<e.length;++f)buttons[e[f].id]=e[f],setState(buttons[e[f].id])})},socket.on("door",function(a){var b=JSON.parse(a);doors[b.id]=b.data,setState(buttons[b.id])}),socket.on("vote",function(a){var b=JSON.parse(a);console.log(b);var c=b.id,d=b.data,e=document.getElementById(c+"Timer"),f=document.getElementById(c+"Button"),g=d.cd;f.setAttribute("disabled","true");var h=setInterval(function(){0===g--?(e.innerHTML="&nbsp;",clearInterval(h),f.removeAttribute("disabled")):e.innerHTML=g+" сек."},1e3)});