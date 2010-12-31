var Path = require('path'),
    Url = require('url'),
    Fs = require('fs'),
    getMime = require('./simple-mime')("application/octet-stream");

var ENOENT = process.ENOENT || require('constants').ENOENT;

var StreamProto = require('net').Stream.prototype.__proto__;
if (!StreamProto.hasOwnProperty('pipe')) {
  var sys = require('sys');
  StreamProto.pipe = function (other) {
    sys.pump(this, other);
  };
}

// Super simple static file server
module.exports = function setup(mount, root, index) {
  return function (req, res, next) {
    var path = Url.parse(req.url).pathname.replace(/\.\.+/g, '.');
    if (!path || path.substr(0, mount.length) !== mount) {
      return next();
    }
    path = Path.join(root, path.substr(mount.length));
    if (path[path.length - 1] === '/') {
      path = path.substr(0, path.length - 1);
    }
    function onStat(err, stat) {
      if (err) { 
        if (err.errno === ENOENT) { return next(); }
        return next(err);
      }
      if (index && stat.isDirectory()) {
        path = Path.join(path, index);
        return Fs.stat(path, onStat);
      }
      if (!stat.isFile()) {
        return next(err);
      }
      var headers = {
        "Date": (new Date()).toUTCString(),
        "Last-Modified": stat.mtime.toUTCString()
      };
      if (headers["Last-Modified"] === req.headers["if-modified-since"]) {
        res.writeHead(304, headers);
        res.end();
        return;
      }
      headers["Content-Length"] = stat.size;
      headers["Content-Type"] = getMime(path);
      var stream = Fs.createReadStream(path);
      res.writeHead(200, headers);
      stream.pipe(res);
      stream.on('error', next);
    }
    Fs.stat(path, onStat);
  };
};
