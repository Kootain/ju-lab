var Scale = require('../model/Scale');
module.exports = function(server) {
  // Install a `/` route that returns server status
  var router = server.loopback.Router();
  router.get('/', function(req,res){
    res.send(server.scaleAction.getRegisteredList()+server.scaleAction.getUnregisteredList());
  });
  server.use(router);
};
