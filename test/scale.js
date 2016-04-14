var net = require('net');
var process = require('process');
var LOOP_TIME = 10000;
var PORT = 8122;
var obj =[{
  sid: '11',
  weight: 30
},{
  sid: '12',
  weight: 20
},{
  sid: '15',
  weight: 40
},{
  sid: '10',
  weight: 50
},{
  sid: '1e',
  weight: 50
},{
  sid: '21',
  weight: 30
},{
  sid: '22',
  weight: 40
}];

var server = net.createServer((socket) => {
  var interval = setInterval(function() {
    socket.write(JSON.stringify(obj));
    console.log(obj);
  }, LOOP_TIME);
  console.log('connceted!');
  socket.on('close',()=>{
    console.log('conncection lost!');
    clearInterval(interval);
  });
  socket.on('error',()=>{
    console.log('close!');
  })
}).on('error', (err)=>{
  throw err;
});

process.stdin.setEncoding('utf8');

process.stdin.on('readable',()=>{
  var chunk = process.stdin.read();
  if(chunk != null){
    var sid = chunk.match(/[0-9]+:/)[0].replace(':','');
    var weight = chunk.match(/:[0-9]+/)[0].replace(':','');
    var tmp = obj.find((e)=>{return e.sid == sid});
    if(tmp != undefined){
      tmp.weight = weight;
    }
  }
})

server.listen({host: 'localhost',port:PORT},() => {
  address = server.address();
  console.log('opened server on %j', address);
});