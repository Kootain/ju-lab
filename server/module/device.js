var device = function (name, ip, MAC, port){
  var _name = name;
  var _ip = ip;
  var _port =port;
  var _MAC = MAC
  var client = new  require('net').Socket();
  var _info=null;
  var colorlog = require('../tools/colorlog');
  var _isConnected = false;
  
  this.isConnected = function(){
    return _isConnected;
  };

  this.getInfo = function (){
    return {
      name:_name,
      ip:_ip
    };
  };

  this.getDeviceDetails = function (model,MAC){
    model.find({'where': {'MAC': MAC}})
    .then(function(data){
      if(data.length != 1){
        throw new error('duplicate result returned');
      } else {
        _info = data[0];
      }
    });
  };

  this.try = function(event){
    var _this = this;
    client.connect(_port, _ip, function(){
      _isConnected = true;
      event.emit('try',{connector:_this, MAC: _MAC});
      
    });

    client.once('error',function(){
      event.emit('try',{connector:_this, MAC: _MAC});
      _isConnected = false;
    });

    client.once('timeout',function(){
      event.emit('try',{connector:_this, MAC: _MAC});
      _isConnected = false;
    });
  };

  this.data = function(callback){
    if(!_isConnected){
      return false;
    }
    client.on('data', function(data){
      colorlog.info(['get data from server']);
      colorlog.warning([data.toString()]);
      callback(data);
    });
    return true;
  }

  this.connect = function (callback){
    console.log(_name +' '+_ip+ ' '+_port);
    if(_isConnected) {
      colorlog.error(colorlog.log[_name, ' already connected']);
      return false;
    }

    client.connect(_port, _ip, function(){
      _isConnected= true;
      colorlog.log(['connected device: ',_name||'undefined',', ',_ip,':',_port]);
    });

    client.on('error', function (err){
      colorlog.warning(err);
      //TODO reconnect
    });

    client.on('data', function(data){
      colorlog.info(['get data from server']);
      colorlog.warning([data.toString()]);
      callback(data);
    });

    client.on('close', function() {
        colorlog.info(['connection with ', _name ,' closed.']);
        client.end();
    });

    return true;
  };

  this.close=function (){
    if(!_isConnected) {
      colorlog.error(colorlog.log([_name, ' already closed']));
      return false;
    }
    client.end();
    return true;
  };

  this.send=function (data){
    if(!_isConnected){
      colorlog.error(colorlog.log[_name, ' already connected']);
      return false;
    }

    client.write(data);
  };
}

module.exports = device;