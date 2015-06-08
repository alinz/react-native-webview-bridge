'use strict';

var webStatic = require('node-static');
var path = './public';

var fileServer = new webStatic.Server(path);

var server = require('http').createServer(function (request, response) {
  request.addListener('end', function () {
    fileServer.serve(request, response);
  }).resume();
});

server.listen(10101);

process.on('SIGTERM', function () {
  server.close(function () {
    process.exit(0);
  });
});
