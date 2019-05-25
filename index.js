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
if(process.env.CUSTOMPASS) { 
  var pass = process.env.CUSTOMPASS;
}
var lecertpath = '/etc/letsencrypt/live/' + process.env.SERVERIP + '/fullchain.pem';
var lekeypath = '/etc/letsencrypt/live/' + process.env.SERVERIP + '/privkey.pem';
var privateKey = fs.readFileSync(lekeypath).toString();
var certificate = fs.readFileSync(lecertpath).toString();

// Proxy server
var proxyServer = https.createServer({key: privateKey,cert: certificate}, function (req, res) {
  var subdomain = req.headers.host.split('.')[0];
  // Bypass auth if this is a public port
  if ( parseInt(subdomain) >= 49050 && parseInt(subdomain) <= 49150){
    proxyrequest(subdomain);
  }
  else {
    // Check for auth
    if (auth(req) == true){
      var parsed = url.parse(req.url,true);
      if (subdomain == 'taisun-gateway'){
        var safeSuffix = parsed.pathname.replace(/^(\.\.[\/\\])+/, '');
        if (safeSuffix == '/' ){
          var safeSuffix = '/public/index.html';
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
                var templated = data.toString('utf8').replace('%%%CONTAINERS%%%',body).replace('%%%TAISUNPORT%%%',taisunport).replace('%%%TAISUNAUTH%%%',pass);
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
        proxyrequest(subdomain);
      }
    }
    else{
      res.statusCode = 401;
      res.setHeader('WWW-Authenticate', 'Basic realm="Login"');
      res.end('<html><body>You shall not pass</body></html>');
    }
  }

function proxyrequest(port){
  var endpoint = 'http://' + ip + ':' + port;
  proxy.web(req, res, {target: endpoint}, function(e) {
    res.statusCode = 200;
    res.write(JSON.stringify(e));
    return res.end();
  });
}

});

// Handle websocket upgrades
proxyServer.on('upgrade', function (req, socket) {
  // Check for auth
  if (auth(req) == true){
    var subdomain = req.headers.host.split('.')[0];
    // make sure port is ok
    if(isNaN(parseFloat(subdomain)) || parseInt(subdomain) <= 0 || parseInt(subdomain) >= 65536){
      socket.end('Not a valid SubDomain');
    }
    else{
      var endpoint = 'http://' + ip + ':' + subdomain;
      proxy.ws(req, socket, {target: endpoint}, function(e) {
        console.log(JSON.stringify(e));
      });
    }
  }
  else{
    socket.statusCode = 401;
    socket.setHeader('WWW-Authenticate', 'Basic realm="Login"');
    socket.end('<html><body>You shall not pass</body></html>');
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
