var SocketPromiseHandler = require('socket-stress-test')
 
socket_handler = new SocketPromiseHandler({
     ioUrl: 'http://192.168.10.178:3000'
      , connectionInterval: 1000 // Fire one each second
      , maxConnections: 1000 // Stop at having 100 connections
      , ioOptions: {
            transports: ['websocket'], // force only websocket (optional)
        }
})

socket_handler.new(function(socketTester, currentConnections) {
        // New connection comes in.
    })
    .disconnect(function(socketTester) {
        // Connection is disconnected by socket
    })
    .addEmit('labirint_setup', {}, 200) // After 1000
    .addEmit('labirint_setup', {id: 'd3', s: 'o'}, 200) // After 1000
    .run();