var FS = require('fs'),
    Url = require('url');

module.exports = function setup(mount, root) {
  return function handle(req, res, next) {
    if (req.method !== "PUT") return next();
    if (!req.uri) { req.uri = Url.parse(req.url); }
    var stream = FS.createWriteStream(req.uri.pathname);
    stream.on('error', next);
    req.pipe(stream);
    req.on('end', function () {
      res.writeHead(200, {});
      res.end();
    });
  };
};
