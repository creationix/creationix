/*global Buffer*/
var Path = require('path'),
    Url = require('url'),
    Fs = require('fs');

var ENOENT = process.ENOENT || require('constants').ENOENT;

// Super simple static file server
module.exports = function setup(mount, root) {
  return function (req, res, next) {
    var path = Url.parse(req.url).pathname.replace(/\.\.+/g, '.');
    if (!path || path.substr(0, mount.length) !== mount) {
      return next();
    }
    path = path.substr(mount.length);
    if (path[path.length - 1] === '/') {
      path = path.substr(0, path.length - 1);
    }
    Fs.readdir(Path.join(root, path), function (err, files) {
      if (err) { 
        if (err.errno === ENOENT) { return next(); }
        return next(err);
      }
      files = files.filter(function (file) {
        return file[0] !== '.';
      });
      if (path.length) {
        files.unshift('..');
      }
      var counter = files.length;
      var data = new Array(counter);
      files.forEach(function (file, i) {
        Fs.stat(Path.join(root, path, file), function (err, stat) {
          if (stat.isDirectory()) {
            file += "/";
          }
          data[i] = err || {
            name: file,
            path: Path.join(path, file),
            size: stat.size,
            isFile: stat.isFile(),
            isDirectory: stat.isDirectory(),
            mtime: stat.mtime.getTime(),
            ctime: stat.ctime.getTime()
          };
          counter--;
          if (counter === 0) {
            data = JSON.stringify(data);
            res.writeHead(200, {
              "Content-Length": Buffer.byteLength(data),
              "Content-Type": "application/json"
            });
            res.end(data);
          }
        });
      });
    });
  };
};
