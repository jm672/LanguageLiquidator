//requires
const express = require('express');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const port = process.env.PORT || 3000;

// express routing
app.use(express.static('public'));


// signaling
io.on('connection', function (socket) {

    socket.on('create or join', function (room) {
        
        var myRoom = io.sockets.adapter.rooms[room] || { length: 0 };
        var numClients = myRoom.length;
        var clientID = room + numClients;
        socket.emit('exchangeClientID',clientID);
            
        if (numClients == 0) {
            socket.join(room);
            socket.emit('created', (room));
        } else if (numClients == 1) {
            socket.join(room);
            socket.emit('joined', room);
        } else {
            socket.emit('full', room);
        }
    });

    socket.on('ready', function (room){
        socket.broadcast.to(room).emit('ready');
    });

    socket.on('candidate', function (event){
        socket.broadcast.to(event.room).emit('candidate', event);
    });

    socket.on('offer', function(event){
        socket.broadcast.to(event.room).emit('offer',event.sdp);
    });
    
    socket.on('answer', function(event){
        socket.broadcast.to(event.room).emit('answer',event.sdp);
    });
    
    socket.on('translation', function(msg){
        console.log("transmitting CID and message");
    	socket.broadcast.emit('translation', msg);
  	});

});

// listener
http.listen(port || 3000, function () {
    console.log('listening on', port);
});