/**
 * MainCtrl - controller
 */
tools={};
webConfig={
  shelfX : 4,
  shelfY : 3
}
function mainCtrl($scope, Scale,notify) {
  this.userName = 'tanki';
  this.helloText = 'Welcome in SeedProject';
  this.descriptionText = 'It is an application skeleton for a typical AngularJS web app. You can use it to quickly bootstrap your angular webapp projects and dev environment for these projects.';
  tools.notify=function(type,msg){
    notify.config({duration:1500});
    notify({ message: msg, classes: type, templateUrl: 'views/common/notify.html'});
  };
  tools.deletenotify=function(type,msg,dur,_scope){
    notify.config({duration:dur});
    notify({ message: msg, classes: type, scope: _scope, templateUrl: 'views/common/deletenotify.html'});
  }
  tools.randomStr=function (len) {
  　　len = len || 32;
  　　var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';  /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
  　　var maxPos = $chars.length;
  　　var pwd = '';
  　　for (i = 0; i < len; i++) {
  　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  　　}
  　　return pwd;
  }

  $scope.commingSoon=function(){
    tools.notify('alert-info','this function will come soon.');
  }

  $scope.webStatus=true;
  Offline.on('down', function () {
    console.log('down');
    $scope.webStatus=false;
    tools.notify('alert-danger','lose connection with router.');
    $scope.$apply();
  });
  Offline.on('up', function () {
    console.log('up');
    $scope.webStatus=true;
    tools.notify('alert-success','reconneted to the router.');
    $scope.$apply();
  });
};

function statusCtrl($scope){
};

function deviceOverviewCtrl() {
}; 

function deviceCtrl($scope, $http, $modal, Scale) {

  $scope.queryDevice=function(cb){
    $http.get('env/devices')
    .success(function(data, status, headers, config){
      var devicesList=angular.fromJson(data);
      online=devicesList.online.map(function(e){
        e.isOnline=true;
        return e;
      });
      offline=devicesList.offline.map(function(e){
        e.isOnline = false;
        return e;
      });
      $scope.devices=online.concat(offline);
      $scope.isLoading=false;
      if(cb)cb();
    })
    .error(function(data, status, headers, config){
      $scope.isLoading=false;
      tools.notify('alert-danger','load devices failed, please try again.');
    });
  }

  $scope.devices=[];
  $scope.queryDevice();
  $scope.mustOnline=true;
  this.deviceListFilter=function(v,i,a){ 
    // console.log(v,!$scope.mustOnline||v.isOnline);
    return !$scope.mustOnline||v.isOnline;
  };

  $scope.detectDevice = function () {
    var modalInstance = $modal.open({
      templateUrl: 'views/device/modal_add_device.html',
      size: 'sm',
      controller: 'deviceDetection',
      scope:$scope
    });
  };

  $scope.deviceDetail = function(d){

    $scope.reagentScale = d;
    $scope.floor=window.Math.floor;
    var typeList={
            scale:{
              templateUrl:'views/device/scale_page.html',
              controller:'scalePageCtrl'
            },
            scanner:{
              templateUrl:'views/device/scale_page.html',
              controller:'scannerPageCtrl'
            }
          };

    var modalInstance= $modal.open({
      templateUrl: typeList[d.type].templateUrl,
      size: 'md',
      controller: typeList[d.type].controller,
      scope:$scope
    });
  };
};

function scalePageCtrl($scope, $modal, $http, $modalInstance, Scale, Weight, Reagent, Scalelog){

  $scope.from=new Date();
  $scope.from.setMonth($scope.from.getMonth()-1);
  $scope.to=new Date();
  $scope.option = {
    series: {
      lines: {
        show: false,
        fill: true
      },
      splines: {
        show: true,
        tension: 0.4,
        lineWidth: 1,
        fill: 0.4
      },
      points: {
        radius: 0.2,
        show: true
      },
      shadowSize: 2,
      grow: {stepMode:"linear",stepDirection:"up",steps:80}
    },
    grow: {stepMode:"linear",stepDirection:"up",steps:80},
    grid: {
      hoverable: true,
      clickable: true,
      tickColor: "#d5d5d5",
      borderWidth: 1,
      color: '#d5d5d5'
    },
    colors: ["#1ab394", "#464f88"],
    xaxis: {
    },
    yaxis: {
      ticks: 4
    },
    tooltip: false
  };
  this.sliderOptions = {
    min: $scope.from.getTime(),
    max: $scope.to.getTime(),
    type: 'double',
    force_edges: true,
    values_separator: '→',
    grid: true,
    prettify: function(num){
      return new Date(num).format("yyyy-MM-dd");
    },
    onFinish: function(data){
      $scope.from=new Date(data.from);
      $scope.to=new Date(data.to);
      $scope.queryData($scope.selectedScales);
    }
  };

  $scope.close = $modalInstance.close;

  $scope.reagentUsage=[];

  //获取秤上物品列表
  $scope.itemList=[];
  Reagent.find({},function(val){
    $scope.itemList = val;
  });
  //获取在线未注册设备
  $http.get('env/devices').then((res)=>{
    $scope.unKnowList=res.data.unKnown;
  },(res)=>{
    console.log('Get unKnown device error!');
  });
  $a= $scope;

  //前台选择后的item_id，scale_id
  $scope.itemChanged = ($scope.reagentScale.hasOwnProperty('scalelogs'))?$scope.reagentScale.scalelogs.item_id:0;
  $scope.scaleChanged = $scope.reagentScale.sid||0;
  $scope.fullChanged = ($scope.reagentScale.hasOwnProperty('scalelogs'))?$scope.reagentScale.scalelogs.full:0;

  $scope.saveScale = function(){
    console.log('save');
    Scale.create({
      sid: $scope.scaleChanged.sid,
      pos : $scope.reagentScale.pos
    },function(data){
      console.log(data);
    });
  }

  $scope.saveItem = function(scale){
    console.log(scale);
    var data={
      "item_id": $scope.itemChanged,
      "full": scale.weight||scale.scalelogs.weight,
      "weight": scale.weight||scale.scalelogs.weight
      };
    Scalelog.create(data,(data,hearder)=>{
      scale.scalelog_id = data.id;
      Scale.update({
        where:{id:scale.id}
      },scale,function(val, resHeader){
         tools.notify('alert-success', 'Update success');
      },function(err){
        tools.notify('alert-danger', err.data.error.message);
      });
    });      
  }

  $scope.saveFull = (scale)=>{
    Scalelog.update({
      where: {id : scale.scalelogs.id}
    },{full: $scope.fullChanged},(val, resHeader)=>{
      tools.notify('alert-success', 'Update success');
    },(err)=>{
      tools.notify('alert-danger', err.data.error.message);
    });
  }
  $scope.buy = (scale)=>{
    console.log(scale);
    var html = `<table  border="1">
      <tr>
        <td>称名</td> <td>{0}</td>
      </tr>
      <tr>
        <td>试剂名称</td> <td>{1}</td>
      </tr>
      <tr>
        <td>试剂余量</td> <td>{2}KG</td>
      </tr>
      <tr>
        <td>试剂满重</td><td>{3}KG</td>
      </tr>
      <tr>
        <td>试剂栏位</td> <td>{4}</td>
      </tr>
      <tr>
        <td>实验室名称</td> <td>{5}</td>
      </tr>
      <tr>
        <td>订单时间</td><td>{6}</td>
      </tr>
    </table>`.format(scale.name,scale.scalelogs.items.name,scale.scalelogs.weight,scale.scalelogs.full,scale.pos,'Julab',new Date().format("yyyy-MM-dd hh:mm"));
    message = {
      to: "gaoty@qq.com",
      data: html
    }
    $http.post('/mail',message).
      success(function(data, status, headers, config){
        console.log('> email post to server');
        tools.notify('alert-success','订单已成功发出！');
        data = {
          state : 3
        };
        Scale.updateAll({where : {id : scale.id}}, data, function(){});
      }).
      error(function(data, status, headers, config){
        console.log(status);
      });
  }
      //TODO if there is no data in weight error
      //TODO device list should content device's id
};

function scannerPageCtrl($scope, $modal, $modalInstance){
  //TODO scanner detail page
  $scope.close=$modalInstance.close;
}

function widgetFlotChart() {


  /**
   * Flot chart data and options
   */
  var d1 = [[1262304000000, 6], [1264982400000, 3057], [1267401600000, 20434], [1270080000000, 31982], [1272672000000, 26602], [1275350400000, 27826], [1277942400000, 24302], [1280620800000, 24237], [1283299200000, 21004], [1285891200000, 12144], [1288569600000, 10577], [1291161600000, 10295]];
  var d2 = [[1262304000000, 5], [1264982400000, 200], [1267401600000, 1605], [1270080000000, 6129], [1272672000000, 11643], [1275350400000, 19055], [1277942400000, 30062], [1280620800000, 39197], [1283299200000, 37000], [1285891200000, 27000], [1288569600000, 21000], [1291161600000, 17000]];

  var flotChartData1 = [
    { label: "Data 1", data: d1, color: '#17a084'},
    { label: "Data 2", data: d2, color: '#127e68' }
  ];

  var flotChartOptions1 = {
    xaxis: {
      tickDecimals: 0
    },
    series: {
      lines: {
        show: true,
        fill: true,
        fillColor: {
          colors: [{
            opacity: 1
          }, {
            opacity: 1
          }]
        }
      },
      points: {
        width: 0.1,
        show: false
      }
    },
    grid: {
      show: false,
      borderWidth: 0
    },
    legend: {
      show: false
    }
  };

  var flotChartData2 = [
    { label: "Data 1", data: d1, color: '#19a0a1'}
  ];

  var flotChartOptions2 = {
    xaxis: {
      tickDecimals: 0
    },
    series: {
      lines: {
        show: true,
        fill: true,
        fillColor: {
          colors: [{
            opacity: 1
          }, {
            opacity: 1
          }]
        }
      },
      points: {
        width: 0.1,
        show: false
      }
    },
    grid: {
      show: false,
      borderWidth: 0
    },
    legend: {
      show: false
    }
  };

  var flotChartData3 = [
    { label: "Data 1", data: d1, color: '#fbbe7b'},
    { label: "Data 2", data: d2, color: '#f8ac59' }
  ];

  var flotChartOptions3 = {
    xaxis: {
      tickDecimals: 0
    },
    series: {
      lines: {
        show: true,
        fill: true,
        fillColor: {
          colors: [{
            opacity: 1
          }, {
            opacity: 1
          }]
        }
      },
      points: {
        width: 0.1,
        show: false
      }
    },
    grid: {
      show: false,
      borderWidth: 0
    },
    legend: {
      show: false
    }
  };

  /**
   * Definition of variables
   * Flot chart
   */

  this.flotChartData1 = flotChartData1;
  this.flotChartOptions1 = flotChartOptions1;
  this.flotChartData2 = flotChartData2;
  this.flotChartOptions2 = flotChartOptions2;
  this.flotChartData3 = flotChartData3;
  this.flotChartOptions3 = flotChartOptions3;
};

function deviceDetection($scope, $http, $modal, $modalInstance){
  $scope.$modalInstance=$modalInstance;
  $scope.devicesUnknown=[];
  $scope.iconType={
    scanner: 'fa-bullseye',
    scale: 'fa-bars',
    mobile: 'fa-mobile-phone',
    web: 'fa-laptop'
  };

  $scope.isLoading;
  var modal={
    ok: function () {
      console.log('$scope work');
        $modalInstance.close();
      },

    cancel: function () {
          $modalInstance.dismiss('cancel');
        }
    };
  $scope.scan=function(){
    $scope.isLoading=true;
    $http.get('env/devices')
    .success(function(data, status, headers, config){
      $scope.devicesList=angular.fromJson(data);
      $scope.devicesUnknown=$scope.devicesList.unKnown;
      console.log($scope.devicesUnknown);
      // $scope.devicesUnknown=$scope.devicesUnknown.map(function(e){
      //   e.type='scale';
      //   e.name=e.MAC;
      //   return e});
      for(var x in $scope.devicesUnknown){
        $scope.devicesUnknown[x].type = 'scale';
        $scope.devicesUnknown[x].name = $scope.devicesUnknown[x].MAC;
      }
      $scope.isLoading=false;
    })
    .error(function(data, status, headers, config){
      $scope.isLoading=false;
      tools.notify('alert-danger', 'get device list error,please try again.');
    });
  }
  $scope.scan();
  $scope.deviceDetail={};
  $scope.ok=modal.ok;
  $scope.cancel=modal.cancel;
  $('#list').slimScroll({
    height: '250px'
  });

  $scope.registerDevice=function (deviceInfo) {
    $modal.open({
      templateUrl: 'views/device/device_add_form.html',
      size: 'md',
      controller: 'addDevice',
      resolve:{
        'deviceInfo':function(){
          return deviceInfo;
        }
      },
      scope:$scope
    });

  };
};

function addDevice($scope, $modalInstance, deviceInfo, Scale, Item){
  $scope.formDetails={
            name:deviceInfo.name,
            MAC:deviceInfo.MAC,
            type:deviceInfo.type,
            reagent: "",
            pos: -1
          };
  $scope.reagents=[{'name':'oooops, nothing','id':-1}];
  $scope.selectedReagents=[];

  $scope.search = function(keyword){
    return Item.find({filter:{ "order":"id desc","where":{"name":{"like":"%"+keyword+"%"}}}},function(val){
      $scope.reagents=val;
    },
    function(res){
       tools.notify('alert-danger',res.data.error.message);
    }).$promise;
  };

  
  $scope.submit = function() {
    if ($scope.detailForm.$valid) {
      console.log($scope.detailForm.pos);
      Scale.create(
      {
        MAC:deviceInfo.MAC,
        name:$scope.formDetails.name,
        type:deviceInfo.type,
        item_id: $scope.formDetails.reagent,
        pos : $scope.formDetails.pos
      }
      ,function (val,resHeader){
        $a=$scope;
        $modalInstance.close();
        tools.notify('alert-success','register device success');
        $scope.$parent.$modalInstance.close();
        // $scope.$parent.$parent.devices=Scale.find(
        //   function(val){
        //     // debugger;
        //     $scope.$apply();
        //     console.log(val);
        //   },
        //   function(res){
        // });
        $scope.queryDevice($scope.$apply);
      }
      ,function (res){
        tools.notify('alert-danger',res.data.error.message);
      });
    }
  }

  var refreshChosen=function(){
    $('#myChosen').chosen('destroy').chosen({max_selected_options: 1});
  };
  Item.find({filter:{ "order":"id desc","where":{"name":{"like":"%"+''+"%"}}}},function(val){
      $scope.reagents=val;
    },
    function(res){
       tools.notify('alert-danger',res.data.error.message);
    }).$promise.then(refreshChosen,refreshChosen);

  Scale.find().$promise.then(function(data){
    $scope.scales = tools.outputShelf(data);
  });
  
};


function reagentCtrl($scope, $modal, $compile, $timeout, $http, RfidInfo, ngTableParams, DTColumnBuilder, DTOptionsBuilder, DTColumnDefBuilder) {
  var table=$('#reagents-table').dataTable();

  $a = $scope;
  $scope.selectAll=false;
  $scope.reagentsAdd=[];

  // this.dtOptions = DTOptionsBuilder.newOptions()
  // .withPaginationType('full_numbers').withDisplayLength(10)
  // .withOption('rowCallback', function(nRow, aData, iDisplayIndex, iDisplayIndexFull){
  //   $('td', nRow).unbind('click');
  //   $('td', nRow).bind('click', function() {
  //     // console.log($('input',nRow).attr('id'));
  //   });
  //   return nRow;
  // });
  // this.dtColumnDefs = [
  //   DTColumnDefBuilder.newColumnDef(0).notSortable(),
  //   DTColumnDefBuilder.newColumnDef(1),
  //   DTColumnDefBuilder.newColumnDef(2),
  //   DTColumnDefBuilder.newColumnDef(3).notSortable(),
  // ];
  var ShakeHands = (function () {
    function ShakeHands(prefix) {
      this.start = prefix + "." + "ShakeHands.start";
      this.accept = prefix + "." + "ShakeHands.accept";
      this.reject = prefix + "." + "ShakeHands.reject";
    }
    return ShakeHands;
  })();
  var job = (function () {
    function job(prefix) {
      this.shakeHands = new ShakeHands(prefix + ".Job");
      this.submit = prefix + "." + "Job.submit";
      this.spread = prefix + "." + "Job.spread";
    }
    return job;
  })();
  var Connection = (function () {
    function Connection() {
    }
    Connection.in = "Connection.in";
    return Connection;
  })();
  var RegisterReagents = (function () {
    function RegisterReagents() {
    }
    RegisterReagents.isInProcess = "RegisterReagents.isInProcess";
    RegisterReagents.Job = new job("RegisterReagents");
    RegisterReagents.update = "RegisterReagents.update";
    return RegisterReagents;
  })();
  var QuickRegisterReagents = (function () {
    function QuickRegisterReagents() {
    }
    QuickRegisterReagents.Job = new job("QuickRegisterReagents");
    return QuickRegisterReagents;
  })();
  var FindReagents = (function () {
    function FindReagents() {
    }
    FindReagents.Job = new job("FindReagents");
    return FindReagents;
  })();

  $scope.find = function(){
    var data = {};
    data.serial = tools.randomStr(10); //todo
    data.list = $scope.reagents.filter(function(e){
      return e.selected;
    }).map(function(e){
      return e.rfid;
    });
    console.log(data);
    socket.emit(FindReagents.Job.submit, data);
  };

  $scope.quickRegisterReagents = {
    onData : function(serial,_data){
      socket.on(QuickRegisterReagents.Job.spread,function(_data){
        data = _data;
        console.log(data);
        // console.log(data.serial+' : '+data.rfid);
        $scope.add(data.detail.rfid,data.serial);
        $scope.$apply();
      });

      console.log('ok');
    }
  }
 
  $scope.quickRegisterReagents.onData();
  $scope.toggleAll=function(){
    $scope.selectAll=!$scope.selectAll;
    for(var x=0;x<$scope.reagents.length;x++) {
      $scope.reagents[x].selected = $scope.selectAll;
    }
  };

  // $scope.find=function(){
  //   var toFind=[];
  //   for(var x=0;x<$scope.reagents.length;x++){ 
  //     if($scope.reagents[x].selected) toFind.push($scope.reagents[x].id);
  //   }
  //   socket.emit('submit job',{serial: tools.randomStr(10), list: toFind});
  //   socket.on('search result',function(data){
  //     console.log(data);
  //   })
  // }

  $scope.queryReagents=function(cb){
    $scope.reagentsAdd=[];
    RfidInfo.find({filter:{"order":"id desc"}},function(val){
      $scope.reagents=val;
      for(var x=0;x<$scope.reagents.length;x++) {
        $scope.reagents[x].selected = false;
        $scope.reagents[x].readonly = true;
      }
    },
    function(res){
       tools.notify('alert-danger',res.data.error.message);
    })
    .$promise.then(function(){
      $scope.reagentsBak=angular.copy($scope.reagents);
      if(cb)cb();
    });
  }

  $scope.queryReagents();

  $scope.talbeParams = new ngTableParams(
    {page:1, count:9},
    {
      getData: function($defer, params){
        $defer.resolve($scope.reagents);
      }
    }
  );
  $scope.searchFilter="";

  $scope.refresh=function(){
    $('#reagent-box').fadeOut(function(){
      $scope.queryReagents(function(){$('#reagent-box').fadeIn();});
    });
    console.log("Refresh");
  }


  $scope.makedata=function(){
    for(var i=0;i<20;i++){
      var info={
        name: String(Math.floor(Math.random()*99))+"-"+String(Math.floor(Math.random()*9999))+"-"+String(Math.floor(Math.random()*999)),
        rfid: tools.randomStr(2)+"-"+String(Math.floor(Math.random()*9999999))
      }
      RfidInfo.create(info,
      function(val, resHeader){//success
        //$scope.close(id);
        val.flag=true;
        val.readonly=true;
        $scope.reagents.unshift(val);
      },
      function(res){//error
        console.log(res);
        tools.notify('alert-danger', res.data.error.message);
      });
    }
  };

  
  $scope.deletea=function(_id,cb){
      RfidInfo.deleteById({id: $scope.reagents[_id].id},
        function(){
          $scope.reagentsBak.splice(_id,1);
          console.log("delete");
          if(cb){
            console.log("confirm cb");
            cb();
          }
        },
        function(res,_id){
          console.log("delete failed");
          $scope.reagents.unshift($scope.reagentsBak[_id]);
          $scope.reagentsBak.unshift($scope.reagents.splice(0,1));
          tools.notify('alert-danger', res.data.error.message);
        }
      );
      $scope.reagents.splice(_id,1);
  };

  $scope.deleteReagent=function(id,cb){
    var _delete=function(_id,cb){
      RfidInfo.deleteById({id: _id},
        function(){
          console.log("delete"+_id);
          if(cb){
            console.log("confirm cb");
            cb();
          }
        },
        function(res,_id){
          console.log("delete failed");
          tools.notify('alert-danger', res.data.error.message);
        }
      );
      // $scope.reagents.splice(_id,1);
    }
    if(id||id==0){
      //_delete(id,cb);
      _childScope=$scope.$new();
      _childScope.reagentDeleted=$scope.reagents[id];
      tools.deletenotify('alert-success',$scope.reagents[id].name+' Delete Success!',3000,_childScope);
      _childScope.undo=function(){
        $timeout.cancel(this.deleteSet);
        $scope.reagents.unshift(this.reagentDeleted);
        $scope.reagentsBak.unshift(this.reagentDeleted);
      }
      _childScope.job=function(){
        this.deleteSet=$timeout(_delete.bind(null,this.reagentDeleted.id,cb),3000);
      }
      _childScope.job();
      $scope.reagents.splice(id,1);
      $scope.reagentsBak.splice(id,1);
    }else{
      for(var x=$scope.reagents.length-1;x>=0;x--){
        if($scope.reagents[x].selected){
          _delete($scope.reagents[x].id,cb);
          $scope.reagents.splice(x,1);
          $scope.reagentsBak.splice(x,1);
        }
      }
    }
  };



  $scope.deleteReagents=function(){
    $scope.deleteReagent();
  };

  $scope.saveReagent = function(id){
    var data={
      "rfid": $scope.reagents[id].rfid,
      "name": $scope.reagents[id].name,
      "id": $scope.reagents[id].id,
      };
      if(!(data.name)||(!data.rfid)){
        tools.notify('alert-danger', "Name or Rfid can't be empty!");
        return;
      }
      RfidInfo.update({"where" : {"id":$scope.reagents[id].id}},data,function(val, resHeader){//success
      //$scope.queryReagents();      
      $scope.reagents[id].readonly = true;
    },function(res){//error
      tools.notify('alert-danger', res.data.error.message);
    });
  }

  $scope.cancel = function(id){
    $scope.reagents[id].name = $scope.reagentsBak[id].name;
    $scope.reagents[id].rfid = $scope.reagentsBak[id].rfid;
    $scope.reagents[id].readonly = true;
  }

  $scope.close = function(id){
    $scope.reagentsAdd.splice(id,1);
  }

  $scope.add=function(rfid,serial){
    // var rid=tools.randomStr(10);
    var data={
      name : "",
      rfid : rfid||"",
      id : serial||""
    };
    $scope.reagentsAdd.unshift(data);
  }

  $scope.addReagent=function(id){
    if(!$scope.reagentsAdd[id].name||!$scope.reagentsAdd[id].rfid){
      tools.notify('alert-danger', "Name or Rfid can't be empty!");
      return;
    }

    var info={
       name: $scope.reagentsAdd[id].name,
       rfid: $scope.reagentsAdd[id].rfid
    };
    socket.emit(QuickRegisterReagents.Job.shakeHands.start,{serial:$scope.reagentsAdd[id].id,index:id});
    console.log($scope.reagentsAdd[id].id);
    socket.on(QuickRegisterReagents.Job.shakeHands.accept,function(data){
      RfidInfo.create(info,
        function(val, resHeader){//success
          //$scope.close(id);
          $scope.reagentsBak.unshift(val);
          $scope.reagentsAdd.splice(id,1);
          val.flag=true;
          val.readonly=true;
          $scope.reagents.unshift(val);
        },
        function(res){//error
          console.log(res);
          tools.notify('alert-danger', res.data.error.message);
        });
      socket.removeListener(QuickRegisterReagents.Job.shakeHands.accept);
    });
    socket.on(QuickRegisterReagents.Job.shakeHands.reject,function(data){
      tools.notify('alert-danger','Job has been done!');
      socket.removeListener(QuickRegisterReagents.Job.shakeHands.reject);
      $scope.close(data.index);
    });

  };

 



  $scope.mustOnline=true;
  this.deviceListFilter=function(v,i,a){ 
    //console.log(v,$scope.mustOnline,$scope.mustOnline||v.isOnline);
    return !$scope.mustOnline||v.isOnline;
  };

  $scope.detectDevice = function () {
    var modalInstance = $modal.open({
      templateUrl: 'views/device/modal_add_device.html',
      size: 'sm',
      
      controller: 'deviceDetection'
    });
  };

};
/**
 * chartJsCtrl - Controller for data for ChartJs plugin
 * used in Chart.js view
 */


function scaleOverviewCtrl($scope, $http, $modal, $timeout){
  $scope.floor = Math.floor;
  $scope.scalesList = [];     // init scalesList
  $scope.scalesShelf = [];

  for(var i = 0; i< webConfig.shelfY; i++){     //scalesList will be a two-demision array
    $scope.scalesShelf[i] = [];
    for(var j = 0; j < webConfig.shelfX; j++){
      $scope.scalesShelf[i].push({
        pos:parseInt(i+1)+','+parseInt(j+1)
      });
    }
  }
  var loop = function(){
    $http.get('env/devices').then(function(res){   //sucess callback
      $scope.scalesList = res.data.online;
      for(var i in $scope.scalesList){
        var y = $scope.scalesList[i].pos.match(/[0-9]+,/)[0].replace(',','');
        var x = $scope.scalesList[i].pos.match(/,[0-9]+/)[0].replace(',','');
        $scope.scalesShelf[y-1][x-1] = $scope.scalesList[i];
      }
    },function(res){   //error callback
      console.log('error from env/devices!!',res);
    });
  }
  setInterval(function(){
    loop();
  },3000);

  $scope.scaleDetail = function(scale){
    $scope.reagentScale = scale
    var modalInstance = $modal.open({
      templateUrl: 'views/reagent/scale_page.html',
      size: 'md',
      scope: $scope,
      controller: 'scalePageCtrl'
    });
  };

  //称上物品状态
  $scope.stateStyle = function(state){
    var style = "";
    if(state==1) style="";      //普通展示状态
    if(state==2) style=" new";     //称上新换物品
    if(state==3) style=" low";     //称上物品紧缺
    if(state==4) style=" sending";   //补货中
    if(state==0||state==null) style=" offline";
    return style;
  };
}

function reagentOverviewCtrl($scope, $http, $modal, RfidInfo, Weight, Scale, Item, Reagent, Email){
  
  //称上物品状态
  $scope.stateStyle = function(state){
    var style = "";
    if(state==0) style="";      //普通展示状态
    if(state==1) style=" new";     //称上新换物品
    if(state==2) style=" low";     //称上物品紧缺
    if(state==3) style=" sending";   //补货中
    return style;
  };

  $scope.floor=window.Math.floor;
  $scope.from=new Date();
  $scope.from.setMonth($scope.from.getMonth()-1);
  $scope.to=new Date();
  $scope.option = {
    series: {
      lines: {
        show: false,
        fill: true
      },
      splines: {
        show: true,
        tension: 0.4,
        lineWidth: 1,
        fill: 0.4
      },
      points: {
        radius: 0.2,
        show: true
      },
      shadowSize: 2,
      grow: {stepMode:"linear",stepDirection:"up",steps:80}
    },
    grow: {stepMode:"linear",stepDirection:"up",steps:80},
    grid: {
      hoverable: true,
      clickable: true,
      tickColor: "#d5d5d5",
      borderWidth: 1,
      color: '#d5d5d5'
    },
    colors: ["#1ab394", "#464f88"],
    xaxis: {
    },
    yaxis: {
      ticks: 4
    },
    tooltip: false
  };
  this.sliderOptions = {
    min: $scope.from.getTime(),
    max: $scope.to.getTime(),
    type: 'double',
    force_edges: true,
    values_separator: '→',
    grid: true,
    prettify: function(num){
      return new Date(num).format("yyyy-MM-dd");
    },
    onFinish: function(data){
      $scope.from=new Date(data.from);
      $scope.to=new Date(data.to);
      $scope.queryData($scope.selectedScales);
    }
  };

  //init $scope.scales
  Scale.find(function(val){
    $scope.scales=val;
  },function(err){
    tools.notify('alert-danger',err.data.error.message);
  });
  $scope.selectedScales=[];

  //最近查询
  $scope.color=['label-success', 'label-info', 'label-primary', 'label-default', 'label-primary'];
  $scope.latestSearchedReagent=RfidInfo.find({filter:{order:'gmt_visited DESC',limit:5}},
    function(){
    },
    function(err){
      tools.notify('alert-danger',err.data.error.message);
    }
    );
  $scope.latestSearchedReagent.$promise.then(function(){
    for(var x=0;x<$scope.latestSearchedReagent.length;x++){
      $scope.latestSearchedReagent[x].gmt_visited=new Date($scope.latestSearchedReagent[x].gmt_visited);
    }
  });

  //自动查询
  var FREQUENCY=9000;//query data per 1s.
  setInterval(function(){
  $scope.queryScale();
  },FREQUENCY);
  //架子展示
  $scope.queryScale=function(){
    Scale.find({filter:{
      include:"item"
    }},function(val){
      $scope.reagentsShelf=val.map(function(e){
        e.isselected = true;
        if(e.hasOwnProperty('item')){
          e.reagent_name = e.item.name;
        }else{
          e.reagent_name = '空';
        }
        return e;
      });
    },function(res){
      tools.notify('alert-danger',res.data.error.message);
    }).$promise.then(function(){
      $scope.reagentsShelf = tools.outputShelf($scope.reagentsShelf);
    });
  }
  $scope.queryScale();
  //reagentsShelf 待展示试剂数组
  //n每行显示个数
   
  //同种试剂统计
  Item.find({filter:{
    include : "scale"
  }},function(val){
    $scope.reagentsStat = val.map(function(e){
      e.amount = e.scale.length;
      e.list=[];
      for (var i=0;i<e.scale.length;i++){
        e.list.push(e.scale[i].pos);
      }
        return e;
    });
  });

  //称详情展示
  $scope.scaleDetail = function(scale){
    $scope.reagentScale = scale
    var modalInstance = $modal.open({
      templateUrl: 'views/device/scale_page.html',
      size: 'md',
      scope: $scope,
      controller: 'scalePageCtrl'
    });
  };

  //试剂高亮
  var isselect = false;

  $scope.selectScale = function(list){
    if (list.length == 0){
      return;
    }
    flag = $scope.reagentsShelf[Math.floor(list[0]/4)][list[0]%4].isselected;
    isselect = !(isselect && flag);
    for(i in $scope.reagentsShelf){
      for(j in $scope.reagentsShelf[i]){
        if($scope.reagentsShelf[i][j]){
          $scope.reagentsShelf[i][j].isselected= flag && isselect;
        }
      }
    }
    for(i in list){
      console.log();
      $scope.reagentsShelf[Math.floor(list[i]/4)][list[i]%4].isselected = true;
    }
  }
 
};

function chartJsCtrl() {

  /**
   * Data for Polar chart
   */
  this.polarData = [
    {
      value: 300,
      color:"#a3e1d4",
      highlight: "#1ab394",
      label: "App"
    },
    {
      value: 140,
      color: "#dedede",
      highlight: "#1ab394",
      label: "Software"
    },
    {
      value: 200,
      color: "#b5b8cf",
      highlight: "#1ab394",
      label: "Laptop"
    }
  ];

  /**
   * Options for Polar chart
   */
  this.polarOptions = {
    scaleShowLabelBackdrop : true,
    scaleBackdropColor : "rgba(255,255,255,0.75)",
    scaleBeginAtZero : true,
    scaleBackdropPaddingY : 1,
    scaleBackdropPaddingX : 1,
    scaleShowLine : true,
    segmentShowStroke : true,
    segmentStrokeColor : "#fff",
    segmentStrokeWidth : 2,
    animationSteps : 100,
    animationEasing : "easeOutBounce",
    animateRotate : true,
    animateScale : false
  };

  /**
   * Data for Doughnut chart
   */
  this.doughnutData = [
    {
      value: 300,
      color:"#a3e1d4",
      highlight: "#1ab394",
      label: "App"
    },
    {
      value: 50,
      color: "#dedede",
      highlight: "#1ab394",
      label: "Software"
    },
    {
      value: 100,
      color: "#b5b8cf",
      highlight: "#1ab394",
      label: "Laptop"
    }
  ];

  /**
   * Options for Doughnut chart
   */
  this.doughnutOptions = {
    segmentShowStroke : true,
    segmentStrokeColor : "#fff",
    segmentStrokeWidth : 2,
    percentageInnerCutout : 45, // This is 0 for Pie charts
    animationSteps : 100,
    animationEasing : "easeOutBounce",
    animateRotate : true,
    animateScale : false
  };

  /**
   * Data for Line chart
   */
  this.lineData = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Example dataset",
        fillColor: "rgba(220,220,220,0.5)",
        strokeColor: "rgba(220,220,220,1)",
        pointColor: "rgba(220,220,220,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(220,220,220,1)",
        data: [65, 59, 80, 81, 56, 55, 40]
      },
      {
        label: "Example dataset",
        fillColor: "rgba(26,179,148,0.5)",
        strokeColor: "rgba(26,179,148,0.7)",
        pointColor: "rgba(26,179,148,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(26,179,148,1)",
        data: [28, 48, 40, 19, 86, 27, 90]
      }
    ]
  };

  this.lineDataDashboard4 = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Example dataset",
        fillColor: "rgba(220,220,220,0.5)",
        strokeColor: "rgba(220,220,220,1)",
        pointColor: "rgba(220,220,220,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(220,220,220,1)",
        data: [65, 59, 40, 51, 36, 25, 40]
      },
      {
        label: "Example dataset",
        fillColor: "rgba(26,179,148,0.5)",
        strokeColor: "rgba(26,179,148,0.7)",
        pointColor: "rgba(26,179,148,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(26,179,148,1)",
        data: [48, 48, 60, 39, 56, 37, 30]
      }
    ]
  };

  /**
   * Options for Line chart
   */
  this.lineOptions = {
    scaleShowGridLines : true,
    scaleGridLineColor : "rgba(0,0,0,.05)",
    scaleGridLineWidth : 1,
    bezierCurve : true,
    bezierCurveTension : 0.4,
    pointDot : true,
    pointDotRadius : 4,
    pointDotStrokeWidth : 1,
    pointHitDetectionRadius : 20,
    datasetStroke : true,
    datasetStrokeWidth : 2,
    datasetFill : true
  };

  /**
   * Options for Bar chart
   */
  this.barOptions = {
    scaleBeginAtZero : true,
    scaleShowGridLines : true,
    scaleGridLineColor : "rgba(0,0,0,.05)",
    scaleGridLineWidth : 1,
    barShowStroke : true,
    barStrokeWidth : 2,
    barValueSpacing : 5,
    barDatasetSpacing : 1
  };

  /**
   * Data for Bar chart
   */
  this.barData = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "My First dataset",
        fillColor: "rgba(220,220,220,0.5)",
        strokeColor: "rgba(220,220,220,0.8)",
        highlightFill: "rgba(220,220,220,0.75)",
        highlightStroke: "rgba(220,220,220,1)",
        data: [65, 59, 80, 81, 56, 55, 40]
      },
      {
        label: "My Second dataset",
        fillColor: "rgba(26,179,148,0.5)",
        strokeColor: "rgba(26,179,148,0.8)",
        highlightFill: "rgba(26,179,148,0.75)",
        highlightStroke: "rgba(26,179,148,1)",
        data: [28, 48, 40, 19, 86, 27, 90]
      }
    ]
  };

  /**
   * Data for Radar chart
   */
  this.radarData = {
    labels: ["Eating", "Drinking", "Sleeping", "Designing", "Coding", "Cycling", "Running"],
    datasets: [
      {
        label: "My First dataset",
        fillColor: "rgba(220,220,220,0.2)",
        strokeColor: "rgba(220,220,220,1)",
        pointColor: "rgba(220,220,220,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(220,220,220,1)",
        data: [65, 59, 90, 81, 56, 55, 40]
      },
      {
        label: "My Second dataset",
        fillColor: "rgba(26,179,148,0.2)",
        strokeColor: "rgba(26,179,148,1)",
        pointColor: "rgba(26,179,148,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(151,187,205,1)",
        data: [28, 48, 40, 19, 96, 27, 100]
      }
    ]
  };

  /**
   * Options for Radar chart
   */
  this.radarOptions = {
    scaleShowLine : true,
    angleShowLineOut : true,
    scaleShowLabels : false,
    scaleBeginAtZero : true,
    angleLineColor : "rgba(0,0,0,.1)",
    angleLineWidth : 1,
    pointLabelFontFamily : "'Arial'",
    pointLabelFontStyle : "normal",
    pointLabelFontSize : 10,
    pointLabelFontColor : "#666",
    pointDot : true,
    pointDotRadius : 3,
    pointDotStrokeWidth : 1,
    pointHitDetectionRadius : 20,
    datasetStroke : true,
    datasetStrokeWidth : 2,
    datasetFill : true
  };
};


angular
  .module('julab')
  .controller('mainCtrl', mainCtrl)
  .controller('widgetFlotChart',widgetFlotChart)
  .controller('chartJsCtrl',chartJsCtrl)

  .controller('deviceOverviewCtrl',deviceOverviewCtrl)
  .controller('deviceCtrl', deviceCtrl)
  .controller('deviceDetection', deviceDetection)
  .controller('addDevice', addDevice)
  .controller('scalePageCtrl', scalePageCtrl)
  .controller('scannerPageCtrl', scannerPageCtrl)

  .controller('reagentCtrl', reagentCtrl)
  .controller('reagentOverviewCtrl',reagentOverviewCtrl);




