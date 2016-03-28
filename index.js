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

    let oldpos;
    let anchor;

    socket.on('touchstart', function(position) {
	anchor = position;
	
	let pos = robot.getMousePos();
	oldpos = { x : pos.x / width, y : pos.y / height };
    });

    socket.on('movement', function(position) {
	let cursorpos = { x : position.x, y : position.y };
	
	// Transform the position relative to anchor.  I.e. when the user starts
	// a new press, the previous mouse position is recorded, along with the
	// point on the screen they press. If the user's touch position is at
	// the anchor it will be as if their cursor is at the recorded mouse
	// position. All motion of the mouse is relative to this anchor point.
	//
	// c.f. absolute positioning, where the user trackpad has a one-to-one
	// correspondance with the mouse cursor on the screen at all times,
	// i.e. if we press the top left corner the mouse will move to the top
	// left
	if (anchor !== undefined && oldpos !== undefined) {
	    position.x = position.x - anchor.x + oldpos.x;
	    position.y = position.y - anchor.y + oldpos.y;
	}

	// Bounds checking. Move anchor as we go "into" edge of screen.
	if (position.x < 0) {
	    // Reset anchor, so that the edge of the screen is the new
	    // anchor point
	    anchor.x = cursorpos.x;
	    oldpos.x = 0;
	    
	    position.x = 0;
	}
	if (position.y < 0) {
	    anchor.y = cursorpos.y;
	    oldpos.y = 0;

	    position.y = 0;
	}

	// Mac OS X doesn't seem to like either coordinate == 1
	let edge = 0.9999;
	if (position.x > 1) {
	    anchor.x = cursorpos.x;
	    oldpos.x = edge;
	    
	    position.x = edge;
	}
	if (position.y > 1) {
	    anchor.y = cursorpos.y;
	    oldpos.y = edge;

	    position.y = edge;
	}
	
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
