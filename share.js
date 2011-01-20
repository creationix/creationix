#!/usr/bin/env node

var path = process.cwd();
var http = require('http');
var handler = require('stack')(
  require('creationix/log')(),
  require('creationix/static')('/', path, 'index.html')
);
var PORT = 8080;
function listen() {
  try {
    http.createServer(handler).listen(PORT);
    console.log("Serving %s at http://localhost:%s/", path, PORT);
    try {
      require('child_process').exec('gnome-open http://localhost:' + PORT + '/');
      console.log("Launching in your default browser");
    } catch (err) {
    }
  } catch (err) {
    if (err.errno !== 98) { throw err; }
    PORT++;
    listen();
  }
}
listen();
