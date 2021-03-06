/**
	Copyright © 2015 Digital Airways (www.DigitalAirways.com)
	This work is free. You can redistribute it and/or modify it under the
	terms of the Do What The Fuck You Want To Public License, Version 2,
	as published by Sam Hocevar. 
	See http://www.wtfpl.net for more details.

 **/

module.exports = function(RED) {
    "use strict";
    var Player = require("player");

    var VOLUME_INCREMENT_STEP = 5;

    function Sound(n) {
        RED.nodes.createNode(this, n);
        this.sound = n.sound;
        this.playing = false;
        createPlayer(this, this.sound);
        var node = this;
        this.on('input', function(msg) {
            if(msg.intent || msg.intent == 0) {
                if(msg.intent == 1) { // open
                    startPlayer(node, msg);
                    if(typeof(msg.sound) == "undefined"  || msg.sound == "")
			msg.sound = msg.value||n.sound;
                    msg.payload = n.name;
                    node.send([msg, null]);
                } else if(msg.intent == 0) { // close
                    stopPlayer(node);
                    node.send([msg,null]);
                } else if(msg.intent == 2) { // more
                    var vol = node.player.getVolume();
                    node.player.setVolume(vol + VOLUME_INCREMENT_STEP);
                } else if(msg.intent == 3) { // less
                    var vol = node.player.getVolume();
                    node.player.setVolume(vol - VOLUME_INCREMENT_STEP);
                }
            } else if(msg.intensity) {
                node.player.setVolume(msg.intensity);
            } else if(msg.command && msg.command === "stop" && node.playing) {
                stopPlayer(node);
                node.send([msg,null]);
            } else {
                startPlayer(node, msg);
                if(typeof(msg.sound) == "undefined"  || msg.sound == "")
		    msg.sound = msg.value||n.sound;
                msg.payload = n.name;
                node.send([msg, null]);
            }
        });

        this.on("close", function() {
            if(node.playing)
                node.player.stop();
        });
    }
    RED.nodes.registerType("sound", Sound);

    function createPlayer(node, sound) {
        if(node.playing) {
            stopPlayer(node);
        }
        node.player = new Player([sound]);
        node.player.on("error", function(err) {
            node.warn(err);
        });
    }

    function stopPlayer(node) {
        if(!node.playing) return;
        node.player.stop();
        node.playing = false;
    }

    function startPlayer(node, msg) {
		
		var toplay =  msg.sound || msg.value || msg.payload;
		
		if(toplay == "")
			toplay = node.sound;
		
		if(toplay.charAt(0) != "/" && toplay.indexOf("http://") != 0)
			toplay = "/root/thethingbox/data/sounds/" + toplay;

		if(toplay.indexOf(".") == -1)
			toplay += ".mp3";
		
        if(toplay && node.player.playList()[0] != toplay) {
            createPlayer(node, toplay);
        }
		
        if(node.playing){
            stopPlayer(node);
        }
        node.player.play(function(err) {
            if(err) {
                node.warn(err);
            } else {
                node.send([null, msg]);
            }
            node.playing = false;
        });
        node.playing = true;
    }

}
