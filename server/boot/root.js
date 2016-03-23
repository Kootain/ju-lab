var Scale = require('../model/Scale');
module.exports = function(server) {
  // Install a `/` route that returns server status
  var router = server.loopback.Router();
  router.get('/', function(req,res){
    var mScale = server.models.Scale;
    if(req.query.hasOwnProperty('create')){
      var data = JSON.parse(req.query.create);
      mScale.create(data,function(err,data){
      });
    }
    if(req.query.hasOwnProperty('delete')){
      mScale.destroyById(req.query.delete);
    }
    if(req.query.hasOwnProperty('upsert')){
      mScale.destroyById(req.query.delete);
      var data = JSON.parse(req.query.upsert);
      mScale.upsert(data,function(err,data){
      });
    }
    console.log(server.scaleAction.getRegisteredList());
    console.log(server.scaleAction.getUnregisteredList());
    res.send(server.scaleAction.getRegisteredList());
  });
  server.use(router);
};
