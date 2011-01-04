/*global Buffer*/
var Crypto = require('crypto'),
    Url = require('url');

module.exports = function setup(match, secrets) {
  return function handle(req, res, next) {
    if (!req.hasOwnProperty("uri")) { req.uri = Url.parse(req.url); }
    if (!match.test(req.uri.pathname)) {
      return next();
    }
    if (req.client.remoteAddress !== '127.0.0.1') {
      res.writeHead(302, {"Location": "https://" + req.headers.host + req.url});
      res.end();
      return;
    }
    if (req.client.remoteAddress === '127.0.0.1' && req.headers.authorization) {
      var parts = req.headers.authorization.split(' ');
      parts = (new Buffer(parts[1], 'base64')).toString('utf8').split(':');
      var username = parts[0];
      var password = parts[1];
      var key = Crypto.createHmac('sha1', username).update(password).digest('base64');
      if (key === secrets[username]) {
        return next();
      }
    }
    res.writeHead(401, {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
      "Content-Type": "text/plain"
    });
    res.end("Authorization Required");
  };
};
