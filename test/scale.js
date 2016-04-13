var net = require('net');
var LOOP_TIME = 5000;
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

server.listen({host: 'localhost',port:PORT},() => {
  address = server.address();
  console.log('opened server on %j', address);
});