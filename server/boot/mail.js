'use strict';
var dsConfig = require('../datasources.json');

module.exports = function(app) {
  let stockoutMail = (scale,type)=>{    //type:0 自动发出订单，type:1 用户发出订单
    let date = new Date();
    let to = 'gaoty@qq.com';
    let tpl=`<table  border="1">
      <tr>
        <td>称名</td> <td>${scale.name||''}</td>
      </tr>
      <tr>
        <td>试剂名称</td> <td>${scale.scalelogs.items.name}</td>
      </tr>
      <tr>
        <td>试剂余量</td> <td>${scale.scalelogs.weight}KG</td>
      </tr>
      <tr>
        <td>试剂满重</td><td>${scale.scalelogs.full}KG</td>
      </tr>
      <tr>
        <td>试剂栏位</td> <td>${scale.pos||''}</td>
      </tr>
      <tr>
        <td>实验室名称</td> <td>${'Julab'}</td>
      </tr>
      <tr>
        <td>订单时间</td><td>${date.toLocaleDateString()+' '+date.toLocaleTimeString()}</td>
      </tr>
    </table>`;

    var yourEmailAddress = dsConfig.emailDs.transports[0].auth.user;
    app.models.Email.send({
      to: to,
      from: yourEmailAddress,
      subject: (type)?'聚缘实验室订单':'聚源实验室缺货自动提醒',
      html: tpl
    },function(err) {
      if (err) {
        throw err;
        return 0;
      }
      console.log('> email sent successfully');
      return 1;
    });
  }

  app.stockoutMail = stockoutMail;
}