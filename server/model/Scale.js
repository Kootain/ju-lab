module.exports = function(param){
  param = param || {}; 
  this.name = param.name;
  this.log_id = param.log_id;
  this.sid = param.sid;
  this.pos = param.sid;
  this.is_online = param.is_online;
}