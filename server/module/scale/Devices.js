var scaleData = [];
var process = require('process');

module.exports = function(server){
	process.stdin.setEncoding('utf8');
	process.stdin.on('readable',()=>{
		var chunk = process.stdin.read();
		if(chunk !== null){
			scaleData = JSON.parse(chunk);
		}
	});

	var scale = function(){
		return scaleData;
	}
	return {
		scale : scale
	}
}