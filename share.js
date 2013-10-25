#!/usr/bin/env node

var http = require('http');
var send = require('send');
var url = require('url');
var root = process.argv[2] || process.cwd();

function onRequest(req, res) {
  send(req, url.parse(req.url).pathname)
    .root(root)
    .pipe(res);
}

var PORT = 8080;
function listen() {
  var server = http.createServer(onRequest);
  server.on('error', function (err) {
    if (err.code === 'EADDRINUSE') {
      console.log("Port %s busy, trying the next...", PORT);
      PORT++;
      return listen();
    }
    throw err;
  });
  server.listen(PORT, function () {
    console.log("Serving %s at http://localhost:%s/", root, server.address().port);
  });
}
listen();
