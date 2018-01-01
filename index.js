// Proxy choosing endpoint
var fs = require("fs");
var path = require('path');
var https = require('https');
var http = require('http');
var httpProxy = require('http-proxy');
var url = require('url');
var proxy = httpProxy.createProxyServer();
var ip = process.env.TAISUNIP;
var taisunport = process.env.TAISUNPORT;
var pass = process.env.DNSKEY;
var lecertpath = '/etc/letsencrypt/live/' + process.env.SERVERIP + '/fullchain.pem';
var lekeypath = '/etc/letsencrypt/live/' + process.env.SERVERIP + '/privkey.pem';
var selfcertpath = '/etc/letsencrypt/self.crt';
var selfkeypath = '/etc/letsencrypt/selfkey.pem';
if (fs.existsSync(lecertpath)){
  var privateKey = fs.readFileSync(lekeypath).toString();
  var certificate = fs.readFileSync(lecertpath).toString();
}
else{
  var privateKey = fs.readFileSync(selfkeypath).toString();
  var certificate = fs.readFileSync(selfcertpath).toString(); 
}
// Global var for port setting
port = null;
// Guid pathnames used for the interface and proxy setting
var dashboard = '3f4349dd-54f9-46ab-bab4-33c6fad6a995';
var switcher = '87bdc7b8-a9f2-4857-a94a-9dffe4cec434';

// Proxy server
var proxyServer = https.createServer({key: privateKey,cert: certificate}, function (req, res) {
  // Check for auth
  if (auth(req) == true){
    var parsed = url.parse(req.url,true);
    // If this is a request for changing the port of the proxy execute
    if (parsed.pathname.split('/')[1] == switcher){
      port = url.parse(req.url,true).query.port;
      if (parsed.query.path){
        res.writeHead(302, {
          'Location': '/' + parsed.query.path
        });
      }
      else {
        res.writeHead(302, {
          'Location': '/'
        });
      }
      res.end();
    }
    else if (parsed.pathname.split('/')[1] == dashboard){
      var safeSuffix = parsed.pathname.replace(/^(\.\.[\/\\])+/, '');
      if (safeSuffix == '/' + dashboard || safeSuffix == '/' + dashboard + '/'){
        var safeSuffix = '/' + dashboard + '/index.html';
      }
      var fileLoc = path.join(__dirname, safeSuffix);
      var filename = parsed.pathname.substring(parsed.pathname.lastIndexOf('/')+1);
      fs.readFile(fileLoc, function(err, data) {
        if (err) {
          res.writeHead(404, 'Not Found');
          res.write('404: File Not Found!');
          return res.end();
        }
        else if (filename == 'gateway.js'){
          var options = {
            host: ip,
            port: taisunport,
            path: '/containers'
          };
          http.get(options, function(taisunres) {
            var body = '';
            taisunres.on('data', function(chunk) {
              body += chunk;
            });
            taisunres.on('end', function() {
              var templated = data.toString('utf8').replace('%%%CONTAINERS%%%',body).replace('%%%TAISUNPORT%%%',taisunport);
              res.statusCode = 200;
              res.write(templated);
              return res.end();
            });
          }).on('error', function(e) {
            res.statusCode = 500;
            res.write('Error connecting to taisun');
            return res.end();
          }); 
        }
        else{
          res.statusCode = 200;
          res.write(data);
          return res.end();          
        }
      });
    }
    else{
      // Make sure the port setting is a number
      if(isNaN(parseFloat(port)) || parseInt(port) <= 0 || parseInt(port) >= 65536){
        res.end('port not set');
      }
      else{
        var endpoint = 'http://' + ip + ':' + port;
        proxy.web(req, res, {target: endpoint});
      }
    }
  }
  else{
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="Login"');
    res.end('<html><body>You shall not pass</body></html>');
  }
});

// Handle websocket upgrades
proxyServer.on('upgrade', function (req, socket) {
  // Check for auth
  if (auth(req) == true){
    // make sure port is ok
    if(isNaN(parseFloat(port)) || parseInt(port) <= 0 || parseInt(port) >= 65536){
      res.end('port not set');
    }
    else{
      var endpoint = 'http://' + ip + ':' + port;
      proxy.ws(req, socket, {target: endpoint});
    }
  }
  else{
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="Login"');
    res.end('<html><body>You shall not pass</body></html>');
  }
});

// Check authorization header
function auth(req){
  var auth = req.headers['authorization'];
  if(!auth) {
    return false;
  }
  else {
    var tmp = auth.split(' ');
    var creds = Buffer.from(tmp[1], 'base64').toString().split(':');
    var key = creds[1];
    if (key == pass) {
      return true;
    }
    else {
      return false;
    }
  }  
}

// Launch server
proxyServer.listen(3000);
