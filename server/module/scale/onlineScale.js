/**
* 轮询 oringinData，若有更变 更新 onLineList,offlineList
*
*/
var registeredList = [],      //在线已注册称列表
    unregisteredList = [],  //未注册陈列表
    originData = [],      //在线称列表 todo
    TIMEOUT = 2000,
    tools={};
//判断列表是否变更，0无变更，1设备更新，2重量更新
//a是新数据,b为旧数据
tools.isChange = function(a, b) {      
  var alen = a.length,
      blen = b.length,
      index = 'sid',
      value = 'weight',
      flag = 0;
  if(alen!=blen){
    return 1;
  }else{
    for(var i in a){
      if(a[i][index] != b[i][index]){
        return 1;
      }
      if(a[i][value] != b[i][value]){
        for(var j in registeredList){
          if(registeredList[j][index] == a[i][index]){
            registeredList[j][value] = a[i][value];
          }
        }
        flag = 2;
      }
    }
    return flag;
  }
}

tools.clone = function(o){
  return JSON.parse(JSON.stringify(o));
}

module.exports = function(app) {

  var mScale = app.models.Scale;

  var getList = function(err,data){   //data:服务器上已注册的称，和originData在线列表求出已注册的在线状态和未注册
    if(err){
      console.log(err);
      return;
    }
    var registered = tools.clone(data);   //loopback 返回的对象保护,不能通过字面量添加属性
    var online = originData;
    unregisteredList = tools.clone(online);
    console.log(registered);
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
    return unregisteredList;
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

  //获取数据，并判断是否更新
  var checkChange = function(newData){
    newData = newData.toString();
    try{newData = JSON.parse(newData.substr(0,newData.length-1));}catch(e){console.log(e);}
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
      originData = newData;
      //todo 重量变换通知
      console.log('change weight');
    }
  }

  getRegisterData();

  // var loop = setInterval(checkChange, TIMEOUT, [null,registeredList]);
  
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
    getUnregisteredList : getUnregisteredList,
    checkChange : checkChange
  }
}