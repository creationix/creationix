
module.exports = function setup(domain, handler) {
  return function handle(req, res, next) {
    var host = req.headers.host;
    var i = host.indexOf(":");
    if (i >= 0) host = host.substr(0, i);
    if (host === domain) {
      handler(req, res, next);
    } else {
      next();
    }
  };
};
