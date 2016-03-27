'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var robot = require('robotjs');

var screenSize = robot.getScreenSize();
var height = screenSize.height;
var width = screenSize.width;

app.use('/public', express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
    console.log('a user connected');

    socket.on('disconnect', function() {
	console.log('user disconnected');
    });

    socket.on('movement', function(position) {
	// Scale normalised position to screen size.
	robot.moveMouse(position.x * width, position.y * height);
	console.log(position);
    });

    socket.on('click', function() {
	robot.mouseClick();
	console.log('clicked');
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});
