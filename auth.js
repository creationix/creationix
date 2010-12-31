/*global Buffer*/
var Crypto = require('crypto');

module.exports = function setup(secrets) {
  return function handle(req, res, next) {
    if (req.headers.authorization) {
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
      "WWW-Authenticate": "Basic realm=" + secrets.realm,
      "Content-Type": "text/plain"
    });
    res.end("Authorization Required");
  };
};
