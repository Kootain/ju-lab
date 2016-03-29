/**
* 轮询 oringinData，若有更变 更新 onLineList,offlineList
*
*/
var Scale = require('../../model/Scale');
var TIMEOUT = 2000,
    tools={}
var a = 0;
tools.isChange = function(a, b) {     //判断列表是否变更，0无变更，1设备更新，2重量更新
  var alen = a.length,
      blen = b.length,
      index = 'sid',
      value = 'weight',
      flag = 0
  if(alen!=blen){
    return 1;
  }else{
    for(var i in a){
      if(a[i][index] != b[i][index]){
        return 1;
      }
      if(a[i][value] != b[i][value]){
        flag = 2;
      }
    }
    return flag;
  }
}

tools.clone = function(o){
  return JSON.parse(JSON.stringify(o));
}

module.exports = function(server) {
  var registeredList = [],      //在线已注册称列表
      unregisteredList = [],  //未注册陈列表
      originData = [{sid:'11',weight:1.0},{sid:'12',weigth:2.0}],      //在线称列表 todo
      mScale = server.models.Scale

  var getList = function(err,data){   //data:服务器上已注册的称，和originData在线列表求出已注册的在线状态和未注册
    if(err){
      console.log(err);
      return;
    }
    var registered = data;
    var online = originData;
    unregisteredList = tools.clone(online);
    console.log(unregisteredList);
    registeredList = registered.map(function(e){
      e.is_online = false;
      for(var key in online){
        if(e.sid === online[key].sid){
          e.is_online = true;
          e.weight = online[key].weight;
          delete unregisteredList[key];
        }
      }
      return e;
    });
    for(var i = unregisteredList.length-1;i>= 0;i--){
      if (unregisteredList[i] === undefined) unregisteredList.splice(i,1);
    }
  }
  
  var getRegisterData = function(){
    mScale.find(getList);
  }

  var getRegisteredList = function(){
    return registeredList;
  }

  var getUnregisteredList = function(){
    return unregisteredList
  }

  var registerScale = function(data,cb){
    mScale.create(data,function(err,data){
      if(!err){
        if(cb) cb(err,data);
      }else{
        if(cb) cb(err,data);
      }
    });
  }

  var checkChange = function(){
    a++;
    var newData = (a<2)?[{sid:'11',weight:1.0},{sid:'12',weigth:2.0}]:[{sid:'11',weight:1.0},{sid:'13',weigth:2.0}]; //todo
    var change = tools.isChange(newData,originData);
    if(change == 1){
      originData = newData;
      getList(null,registeredList);
      console.log('change scaleList',registeredList,unregisteredList);
    }
    if(change == 0){
      console.log('noting change on scalelist',registeredList,unregisteredList);
    }
    if(change == 2){
      //todo 重量变换通知
      console.log('change weight')
    }
  }

  getRegisterData();

  var loop = setInterval(checkChange, TIMEOUT, [null,registeredList]);
  
  //秤配置改变监听维护列表
  mScale.observe('after save', function updateOnlineList(ctx, next) {
     getRegisterData();
     next();
  });
  mScale.observe('after delete', function updateOnlineList(ctx, next) {
     getRegisterData();
     next();
  });

  return {
    registerScale : registerScale,
    getRegisteredList : getRegisteredList,
    getUnregisteredList : getUnregisteredList
  }
}