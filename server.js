// gleicon 2010 | http://zenmachine.wordpress.com | http://github.com/gleicon


var sys = require("sys");
var http = require("http")
var qs = require("querystring");
var url = require("url")
var fs = require('fs')

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

function s404(res) {
  res.writeHead(404, {'Content-type':'text/plain'});
  res.write('not found');
  res.end();
}

function render(res, path, contenttype) {
  fs.readFile(__dirname + '/static'+ path, function(err, data) {
    console.log('sending: '+ path);
    if (err) return s404(res);
    res.writeHead(200, {'Content-Type': contenttype })
    res.write(data, 'utf8');
    res.end();
  });
}

server = http.createServer(function (req, res) {
  l = function(m) { 
    res.write(m);
    res.write('\n');
  }

  path = url.parse(req.url).pathname
  switch(req.method) {
    case 'GET':
      switch(path) {
        case '':
        case '/':
        case '/index.html':
          render(res, '/index.html', 'text/html');
          break

        case '/css/style.css':
          render(res, path, 'text/css');
          break
                                            
        case '/js/libs/jquery-1.5.1.min.js':
        case '/js/libs/modernizr-1.7.min.js':
        case '/js/script.js':
          render(res, path, 'js');
          break

        default:
          req.connection.setTimeout(0);
          res.writeHead(200, {'Content-type':'text/plain'});
          if (presence[path] == null) presence[path] = new process.EventEmitter();
          presence[path].addListener('message', l);
          break
      }
      break
                                      
    case 'POST':
      var m ="";
      req.on('data', function(d) { m = m + d });
      req.on('end', function(){
        params = qs.parse(m);
        m = params['body'];
        if (m != null) {
          if (presence[path] == null) presence[path] = new process.EventEmitter()
          presence[path].emit('message', m); //dispatch
        }
      });		
      res.writeHead(200, {'Content-type':'text/plain'});
      res.write('message posted\n');
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

