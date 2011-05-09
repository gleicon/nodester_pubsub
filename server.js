// gleicon 2011 | http://7co.cc | http://zenmachine.wordpress.com | http://github.com/gleicon


var sys = require("sys");
var ws = require("./lib/node.ws.js/ws")
var qs = require("querystring");

process.on('uncaughtException', function (err) {
  console.log('exception: ' + err);
});

console.log('Initializing Watercooler WS server');

var presence = [];
var e_msg = new process.EventEmitter();


ws.createServer(function (websocket) {
    var id;
		var l = function(m) { 
		  if (m.id != id) websocket.write(m.data);
		}
 
		websocket.addListener("connect", function (resource) { 
      console.log("connect: " + resource);
      id = resource + " " + new Date().getTime() + "-" + process.pid;

			if (presence[resource] == null) {
				presence[resource] = new process.EventEmitter();
			}
			
			presence[resource].addListener('message', l);
			
    	var to = setTimeout(function() {
	      presence[resource].removeListener('message', l);
	      sys.puts("timeout from: " + websocket.remoteAddress);
	    }, 60 * 1000 * 60);		

	    websocket.addListener("data", function(data) {
	      var o = new Array();
	      o['id'] = id;
	      o['data'] = data;
	      presence[resource].emit('message', o);
	    });

	    websocket.addListener("close", function () { 
	      presence[resource].removeListener('message', l); 
	      sys.puts("close");
	    });
			//console.log(emitter.listeners(presence[resource]));
		});
        
}).listen(9849);


