var dsConfig = require('../datasources.json');
var bodyParser = require('body-parser');

module.exports = function(app) {
  var router = app.loopback.Router();
  var Scale = require('../module/scale/onlineScale')(app);
  router.get('/status', app.loopback.status());

  router.get('/env/devices',function(req,res,value){
  	//TODO use native api
    var onlines = app.scaleAction.getRegisteredList() || [];
    var unKnown = app.scaleAction.getUnregisteredList() || [];

    var data={
      'online':onlines,
      'unKnown':unKnown
    }
  	res.json(data);
  });

  app.use(bodyParser.raw());
  app.use(bodyParser.json({limit: '1mb'}));  //body-parser 解析json格式数据
  app.use(bodyParser.urlencoded({            //此项必须在 bodyParser.json 下面,为参数编码
    extended: true
  }));

  router.post('/mail',function(req, res, value){
    var yourEmailAddress = dsConfig.emailDs.transports[0].auth.user;
        //console.log(req);
    app.models.Email.send({
      to: req.body.to,
      from: yourEmailAddress,
      subject: '聚缘实验室订单',
      html: req.body.data
      //html: '<strong>HTML</strong> tags are converted'
    }, function(err) {
      if (err) throw err;
      console.log('> email sent successfully');
      res.json({
        status:1
      });
    });

  });

  router.get('')
  
  app.use(router);
};
