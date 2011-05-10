// gleicon 2010 | http://zenmachine.wordpress.com | http://github.com/gleicon


var sys = require("sys");
var http = require("http")
var qs = require("querystring");

process.on('uncaughtException', function (err) {
	console.log('exception: ' + err);
});


var e_msg = new process.EventEmitter();
var users = 0;


setTimeout(connected_users, 1000);

function connected_users() {
  console.log('Connected users: '+users);
  setTimeout(connected_users, 30 * 1000);
}


console.log('Initializing COMET pub/sub server');

server = http.createServer(function (req, res) {
      l = function(m) { 
        res.write(m);
        res.write('\n');
      }
      if (req.url == '/subscribe') {
        req.connection.setTimeout(0);
        res.writeHead(200, {'Content-type':'text/plain'});
        e_msg.addListener('message', l);

      } else if (req.url == '/publish') {
        req.on('data', function(d) {
          params = qs.parse(d);
          m = params['body'];
          if (m != null) e_msg.emit('message', m); 
        });
        res.writeHead(200, {'Content-type':'text/plain'});
        res.write('ok\n');
        res.end();
      } else {
        res.writeHead(404, {'Content-type':'text/plain'});
        res.write('not found');
        res.end();
      }
});

server.maxConnections = 10000;
server.on('request', function() { console.log('conn'); users++; });
server.on('clientError', function() {if (users > 0) users--; }); 

server.listen(9849);
