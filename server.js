// gleicon 2010 | http://zenmachine.wordpress.com | http://github.com/gleicon


var sys = require("sys");
var ws = require("./lib/node.ws.js/ws.js")
var http = require("http");
var qs = require("querystring");

sys.puts('Initializing ws server');

var e_msg = new process.EventEmitter();

ws.createServer(function (websocket) {
    var id;
    websocket.addListener("connect", function (resource) { 
      console.log("connect: " + resource);
      id = new Date().getTime(); 
    });

    var l = function(m) { 
      if (m.id != id) websocket.write(m.data);
    }

    e_msg.addListener('message', l)

    var to = setTimeout(function() {
      e_msg.removeListener('message', l);
      console.log("timeout from: " + websocket.remoteAddress);
    }, 60 * 1000 * 60);

    websocket.addListener("data", function(data) {
      console.log(data);
			var o = new Array();
      o['id'] = id;
      o['data'] = data;
      e_msg.emit('message', o);
    });
    
    websocket.addListener("close", function () { 
      e_msg.removeListener('message', l); 
      console.log("close");
    });
    
}).listen(9849);


