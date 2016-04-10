var colorlog = function () {
};

var merge=function(strArr){
    return String.prototype.concat.apply('',strArr);
};

colorlog.bold = function(str) {
    return '\033[1m'+str+'\033[0m';
};

colorlog.green = function(str) {
    return '\033[32m'+str+'\033[0m';
};

colorlog.yellow = function(str) {
    return '\033[33m'+str+'\033[0m';
};

colorlog.red = function(str) {
    return '\033[31m'+str+'\033[0m';
};

colorlog.blue = function(str) {
    return '\033[34m'+str+'\033[0m';
};

colorlog.log = function(strArr){
    var str = colorlog.bold(merge(strArr));
    console.log(str);
}

colorlog.info =function(strArr){
    console.log(colorlog.bold('[info]\t')+colorlog.blue(merge(strArr)));
}

colorlog.error =function(strArr){
    console.log(colorlog.bold('[error]\t')+colorlog.red(merge(strArr)));
}

colorlog.warning =function(strArr){
    console.log(colorlog.bold('[warning]\t')+colorlog.yellow(merge(strArr)));
}

module.exports = colorlog;