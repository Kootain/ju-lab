var online = require('./onlineScale'),
	weightData = []

var getWeigth = function(){				//从通讯模块获取数据 同步	
	if(ischange(originData)){

	}
	return [{sid:'11',weight:1.0},{sid:'12',weigth:2.0}];	//todo
}
	
var isChange = function(originData){				//判断在线设备是否更新 传入数组皆
	originDate.sort(function(a,b){
		return a.sid < b.sid;
	})

	return true;
}

module.exports = function(server){
	var originData = [],  //在线称列表原始数据



}