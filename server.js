// gleicon 2010 | http://zenmachine.wordpress.com | http://github.com/gleicon


var sys = require("sys");
var http = require("http")
var qs = require("querystring");
var url = require("url")


process.on('uncaughtException', function (err) {
	console.log('exception: ' + err);
});


var users = 0;
var presence = new Array();

function connected_users() {
  console.log('Connected users: '+users);
  setTimeout(connected_users, 30 * 1000);
}

setTimeout(connected_users, 1000);


console.log('Initializing COMET pub/sub server');

server = http.createServer(function (req, res) {
      l = function(m) { 
        res.write(m);
        res.write('\n');
      }

			path = url.parse(req.url).pathname
			switch(req.method) {
				
				case 'GET':
					req.connection.setTimeout(0);
				  res.writeHead(200, {'Content-type':'text/plain'});
				  if (presence[path] == null)	presence[path] = new process.EventEmitter();
					presence[path].addListener('message', l);					
					break
					
				case 'POST':
					var m ="";
	        req.on('data', function(d) {
	          m = m + d 
	        });
					req.on('end', function(){
						params = qs.parse(m);
						m = params['body'];
						if (m != null) {
							if (presence[path] == null) presence[path] = new process.EventEmitter()
							presence[path].emit('message', m);
						}
					});		
					res.writeHead(200, {'Content-type':'text/plain'});
	        res.write('ok\n');
	        res.end();
	        
					break
				
				default:
					res.writeHead(401, {'Content-type':'text/plain'});
	        res.write('Method not allowed');
	        res.end();
					break
			}
			
				
});

server.maxConnections = 10000;
server.on('connection', function(s) { console.log('conn: ' + s.address()); users++; });
server.on('close', function() {if (users > 0) users--; }); 
server.on('clientError', function() {if (users > 0) users--; }); 

server.listen(9849);
