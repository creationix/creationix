var Url = require('url'),
    Fs = require('fs'),
    Path = require('path');

// MVC style controller routing
module.exports = function (root, controllerFolder) {

  // Normalize mount points to always end in /
  if (root[root.length - 1] !== "/") { root += "/"; }
  // Normalize controller folder so require understands it
  controllerFolder = Fs.realpathSync(controllerFolder);

  // Load the controllers at startup
  var controllers = {};
  Fs.readdirSync(controllerFolder).forEach(function (name) {
    var pos = name.lastIndexOf('.');
    var ext = name.substr(pos + 1);
    if (ext === 'js') {
      controllers[name.substr(0, pos)] = require(controllerFolder + "/" + name);
    }
  });

  // Generate a request handling function  
  return function (req, res, next) {
    // parse out pathname if it's not there already (other middleware may have done it already)
    if (!req.hasOwnProperty('uri')) { req.uri = Url.parse(req.url); }
    
    // Mount relative to the given root
    var path = req.uri.pathname;
    if (path.substr(0, root.length) !== root) { return next(); }
    
    // Get the requested controller and method
    var parts = path.substr(root.length).split('/');
    if (parts.length === 0) { parts[0] = "index"; } // Default module to "index"
    if (parts.length === 1) { parts[1] = "index"; } // Default method to "index"
    
    // Find the controller
    var controller = parts.shift();
    if (!controllers.hasOwnProperty(controller)) { return next(); }
    controller = controllers[controller];
    
    // Find the method
    var method = parts.shift();
    if (!controller.hasOwnProperty(method)) { return next(); }
    
    // Call it!
    var args = [req, res, next];
    args.push.apply(args, parts);
    controller[method].apply(controller, args);
  };
  
};

