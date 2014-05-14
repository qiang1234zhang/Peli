var http = require('http');
var fs = require('fs');

var MAIN_HTML = '/dummy_client.html';
var SOCkET_IO = '/../resources/socket.io/socket.io.js';

module.exports = new function() {
	this.create = function() {
		var server = http.createServer(function(request, response) {
			var filename = __dirname + MAIN_HTML;
			if (request.url == "/javascript/clientComs.js") {
				filename = __dirname + "/.." + request.url;
			}

			console.log("'" + request.url + "'");
			console.log(filename);
			
			if (request.method !== ("GET")) {
				return response.end("Simple File Server, only does GET");
			}
			fs.createReadStream(filename).pipe(response);
		});
		return server;
	}
}

