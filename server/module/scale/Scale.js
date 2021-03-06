/**
* 轮询 oringinData，若有更变 更新 onLineList,offlineList
*
*/
var registeredList = [],      //在线已注册称列表
    unregisteredList = [],  //未注册陈列表
    originData = [],      //在线称列表 todo
    TIMEOUT = 2000,
    LOW_PERCENT = 0.2,
    tools={};

tools.clone = function(o){
  return JSON.parse(JSON.stringify(o));
}

module.exports = function(app) {

  var mReagent = app.models.Reagent,
      mScale = app.models.Scale,
      mWeight = app.models.Weight,
      mScalelog = app.models.Scalelog;

  var changeStatus = (scalelog)=>{
    if(scalelog.weight/scalelog.full >= LOW_PERCENT){
      if(!scalelog.stauts){
        scalelog.status = 0;
        return 0;
      }
      return scalelog.status;
    }else{
      if(scalelog.status == 0){   //切换至缺货状态
        mReagent.find({where:{id:scalelog.item_id}},(err,data)=>{
          scale={};
          scale.scalelogs={};
          for(i in scalelog){
            scale.scalelogs[i] = scalelog[i];
          }
          scale.scalelogs.items = data[0];
          console.log(scale);
          app.stockoutMail(scale); //发送缺货提醒
        });
        scalelog.status == 1;
        return 1;
      }
      return scalelog.status;
    }
  }

  var getRegisterData = function(){
    mScale.find({include:'scalelogs'},function(err,data){
      registeredList = tools.clone(data);
      for(var i=unregisteredList.length-1;i>=0;i--){
        if(registeredList.find((e)=>{
          return e.sid === unregisteredList[i].sid
        }) !== undefined){
          unregisteredList.splice(i,1);
        }
      }
    });
  }

  var checkChange = (newData)=>{
    newData = newData.toString();
    try{
      newData = JSON.parse(newData.substr(0,newData.length-1));
    }catch(e){
      try{
        newData = JSON.parse(newData);
      }catch(e){
        newDate=[];
        console.log(e);
      }
    }
    for(var i in registeredList){
      var tmp = newData.find((e)=>{
        if(e === undefined || e === null) return 0;
        return e.sid === registeredList[i].sid;
      });
      if(tmp === undefined){      //offline
        registeredList[i].status = 0;
        continue;
      }
      if (registeredList[i].scalelogs === undefined){   //new
        registeredList[i].weight = tmp.weight;
        registeredList[i].status = 2;
        delete newData[newData.indexOf(tmp)];
        continue;
      }
      if (tmp.weight != registeredList[i].scalelogs.weight){
        registeredList[i].scalelogs.weight = tmp.weight;
        mScalelog.upsert(registeredList[i].scalelogs
        ,(data)=>{
          console.log('log weight success!');
        });
      }else{
        delete newData[newData.indexOf(tmp)];
      }
    }

    for(var i = newData.length-1;i>= 0;i--){
      if (newData[i] === undefined) newData.splice(i,1);
    }
    unregisteredList = newData;
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

  getRegisterData();
  
  //秤配置改变监听维护列表
  mScalelog.observe('after save', function updateOnlineList(ctx, next) {
    getRegisterData();
    next();
  });
  mScalelog.observe('after delete', function updateOnlineList(ctx, next) {
     getRegisterData();
     next();
  });

  mScale.observe('after save', function updateOnlineList(ctx, next) {
    getRegisterData();
    next();
  });
  mScale.observe('after delete', function updateOnlineList(ctx, next) {
     getRegisterData();
     next();
  });


  mScalelog.observe('before save',function logWeight(ctx, next){  //重量变化记录监听
    if(ctx.isNewInstance){
      mWeight.create({
        weight: ctx.instance.weight,
        log_id: ctx.instance.id,
        time : new Date()
      });
      next();
    }else{
      mScalelog.find({where:ctx.where},(err,data)=>{
        for(i in ctx.data){
          data[0][i]=ctx.data[i];
        }
        ctx.data.status = changeStatus(data[0]);
        next();
      });
      mWeight.create({
        weight: ctx.data.weight,
        log_id: ctx.data.id,
        time : new Date()
      });
    }

  });

  return {
    registerScale : registerScale,          
    getRegisteredList : getRegisteredList,     
    getUnregisteredList : getUnregisteredList,
    checkChange : checkChange
  }
}