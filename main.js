var $ = require('jquery');
var attachFastClick = require('fastclick');
var io = require('socket.io-client');

$(function() {
    attachFastClick(document.body);
    
    var socket = io();

    // Logging function.
    var log = function (text) {
	$('#log').text(text + '\n' + $('#log').text());
    };

    var touching = false;

    $('#trackpad').bind('mousedown', function() {
	touching = true;
    });

    $('#trackpad').bind('mouseup', function() {
	touching = false;
    });

    $('#trackpad').bind('mousemove', function() {
    });
    
    $('#trackpad')[0].addEventListener('touchstart', function(e) {
	e.preventDefault();
	touching = true;
    }, false);

    $('#trackpad')[0].addEventListener('touchend', function(e) {
	e.preventDefault();
	touching = false;
    }, false);

    var then = new Date();

    $('#trackpad')[0].addEventListener('touchmove', function(e) {
	e.preventDefault();

	var delay = 1;

	// Wait at least `delay` milliseconds between each touch movement.
	var now = new Date();

	if (now.getTime() - then.getTime() < delay) {
	    return;
	} else {
	    then = new Date();
	}
	
	var touch = e.touches[0];
	var pos = { x: touch.clientX, y: touch.clientY };

	// Normalise to canvas size.
	pos.x = pos.x / $('#trackpad').width();
	pos.y = pos.y / $('#trackpad').height();

	// Renormalise to dead zone
	var deadzone = 0.2;

	pos.x = (pos.x - deadzone) * (1 / (1 - deadzone));
	pos.y = (pos.y - deadzone) * (1 / (1 - deadzone));

	// Set deadzones
	if (pos.x < 0) {
	    pos.x = 0;
	}
	if (pos.y < 0) {
	    pos.y = 0;
	}
	if (pos.x > 1) {
	    pos.x = 1;
	}
	if (pos.y > 1) {
	    pos.y = 1;
	}

	if (touching) {
	    socket.emit('movement', pos);
	}
    }, false);

    $('#click').click(function() {
	socket.emit('click');
    });
});
