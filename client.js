var $ = require('jquery');
var attachFastClick = require('fastclick');
var io = require('socket.io-client');

$(function() {
    attachFastClick(document.body);

    var socket = io();

    // Logging function.
    var log = function(text) {
        $('#log').text(text + '\n' + $('#log').text());
    };

    var touching = false;

    var getPosition = function(touch) {
        var pos = { x: touch.clientX, y: touch.clientY };

        // Normalise to canvas size.
        pos.x = pos.x / $('#trackpad').width();
        pos.y = pos.y / $('#trackpad').height();

        return pos;
    };

    $('#trackpad').bind('mousedown', function() {
        touching = true;
    });

    $('#trackpad').bind('mouseup', function() {
        touching = false;
    });

    $('#trackpad').bind('mousemove', function() {
    });
    
    var tapTimer = new Date();

    $('#trackpad')[0].addEventListener('touchstart', function(e) {
        e.preventDefault();
        touching = true;
        
        tapTimer = new Date();
        
        socket.emit('touchstart', getPosition(e.touches[0]));
    }, false);

    $('#trackpad')[0].addEventListener('touchend', function(e) {
        e.preventDefault();
        touching = false;
        
        // Send click if tap time short enough.
        var delay = 100;
        
        var now = new Date();
        
        if (now.getTime() - tapTimer.getTime() < delay) {
            socket.emit('click');
        }
        
        socket.emit('touchend', getPosition(e.touches[0]));
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
        var pos = getPosition(touch);

        if (touching) {
            socket.emit('movement', pos);
        }
    }, false);

    $('#click').click(function() {
        socket.emit('click');
    });
    
    $('#dblclick').click(function() {
       socket.emit('dblclick'); 
    });
    
    $('#rightclick').click(function() {
       socket.emit('rightclick'); 
    });
    
    var clickHeld = false;
    
    $('#holdclick').click(function() {
       if (clickHeld) {
           $('#holdclick').text('Hold');
       } else {
           $('#holdclick').text('Held');
       }
       
       clickHeld = !clickHeld;
       socket.emit('toggleclick', clickHeld);
    });
    
    $('#scrollup').click(function () {
        socket.emit('scrollup');
    });
    
    $('#scrolldown').click(function () {
        socket.emit('scrolldown');
    });
    
    $('#sendtyping').click(function () {
        var text = $('#typing').val();
        $('#typing').val('');
        socket.emit('typing', text);
    });
    
});
