var http = require('http');
var fs = require('fs');
var express = require('express');
var userID = require('./userIdentification.js');

var server = null;

var nconf = null;
var comServer = null;

module.exports = new function() {
    this.shutdown = function() {
        //server.close(); // doesn't work?
    };

    this.start = function(nconf_,  comServer_) {
        nconf = nconf_;
        comServer = comServer_;
        var express = require('express');

        server = express();

        server.set('views', nconf.get('jade_views'));

        // serve some static files
        server.use("/javascript", express.static(nconf.get('static_javascript')));
        server.use("/data", express.static(nconf.get('static_data')));

        server.get('/javascript/lib/engine.io.js', function(request, response) {
            response.setHeader('content-type', 'text/javascript');
            response.sendfile(__dirname + "/node_modules/engine.io-client/engine.io.js");
        });

        // send client stuff to 
        server.get('/', function(request, response) {
            response.render(nconf.get('client_jade'), {
                "pretty": nconf.get('html_pretty'),
                "title": nconf.get("game_name"),
                "jsdebug": nconf.get("debug"),
                "controller": nconf.get("controller"),
                "client_port": nconf.get("client_port"),
				"com_benchmark": nconf.get("com_benchmark"),
                "userID": userID.getUserID(request),
                "jsonrpc_protocol": nconf.get("jsonrpc_protocol")
            });
        });

        server.get('/screen', function(request, response) {
            response.render(nconf.get('screen_jade'), {
                "pretty": nconf.get('html_pretty'),
                "jsdebug": nconf.get("debug"),
                "screen_port": nconf.get('screen_port'),
                "controller": nconf.get("controller"),
                "jsonrpc_protocol": nconf.get("jsonrpc_protocol")
            });
        });

        server.get('/screen/rendering', function(request, response) {
            response.render('rendering/rendering.jade', {
                "pretty": nconf.get('html_pretty'),
                "jsdebug": nconf.get("debug"),
                "screen_port": nconf.get('screen_port'),
                "controller": nconf.get("controller"),
                "jsonrpc_protocol": nconf.get("jsonrpc_protocol")
            });
        });

        server.get('/screen/renderingPeli', function(request, response) {
            response.render('renderingPeli/renderingPeli.jade', {
                "pretty": nconf.get('html_pretty'),
                "jsdebug": nconf.get("debug"),
                "screen_port": nconf.get('screen_port'),
                "controller": nconf.get("controller"),
                "jsonrpc_protocol": nconf.get("jsonrpc_protocol")
            });
        });

        server.listen(nconf.get('http_port'));

        return this;
    };
}
