/**
* 轮询 oringinData，若有更变 更新 onLineList,offlineList
*
*/
module.exports = function(server) {
  var Scale = require('../../model/Scale');

  var registeredList = [],      //在线已注册称列表
      unregisteredList = [],  //未注册陈列表
      originData = [],      //在线称列表
      mScale = server.models.Scale

  var getData = function(cb){
    var registered =[];
    var online = [{sid:'11',weight:1.0},{sid:'12',weigth:2.0}];

    mScale.find(function(err,data){
      console.log('find data:',data);
      registered = data;
      unregisteredList = online;
      registeredList = registered.map(function(e){
        e.is_online = false;
        for(var key in online){
          if(e.sid === online[key].sid){
            e.is_online = true;
            unregisteredList.splice(key,1);
          }
        }
        return e;
      });
    });


    if(typeof cb === 'function'){
      cb(data);
    }
  }



  var getRegisteredList = function(){
    return registeredList;
  }

  var getUnregisteredList = function(){
    return unregisteredList
  }

  getData();

  mScale.observe('after save', function updateOnlineList(ctx, next) {
     getData();
     next();
     // console.log('changed',obj);
  });
  mScale.observe('after delete', function updateOnlineList(ctx, next) {
     getData();
     next();
     // console.log('changed',obj);
  });

  return {
    getData : getData,
    getRegisteredList : getRegisteredList,
    getUnregisteredList : getUnregisteredList
  }
}