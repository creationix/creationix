
module.exports = function setup(domain, handler) {
  return function handle(req, res, next) {
    if (req.headers.host === domain) { 
      handler(req, res, next);
    } else {
      next();
    }
  };
};
