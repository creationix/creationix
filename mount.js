var Url = require("url");

module.exports = function setup(method, mount, handler) {
  return function handle(req, res, next) {
    if (!req.hasOwnProperty("uri")) { req.uri = Url.parse(req.url); }
    if (req.method === method && req.uri.pathname === mount) {
      handler(req, res, next);
    } else {
      next();
    }
  };
};
