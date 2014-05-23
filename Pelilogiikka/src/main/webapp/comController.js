var eio = require('engine.io');
var WebSocket = require('ws');

var game;
var server;

module.exports = new function() {
	this.start  = function(client_port, gameComs) {
		game = gameComs;
		server = eio.listen(client_port);

        require('util').log('engine.io/controller - listening on ' + client_port);

		server.on('connection', function(socket) {
            require('util').log("engine.io/controller - connection opened");
			var gameSocket = game.getGameSocket();

			if (gameSocket !== undefined && gameSocket !== null) {
                require('util').log("engine.io/controller - connecting client to game");

                game.join(gameSocket, socket);

				gameSocket.on('message', function(data, flags) {
					socket.send(data);
				});

				socket.on('message', function(data) {
                    if (gameSocket.readyState == WebSocket.OPEN) {
                        gameSocket.send(data);
                    }
                    else {
                        require('util').log("engine.io/controller - gameScoket closed, disconnecting client");
                        socket.close();
                    }
				});

				socket.on('close', function() {
                    require('util').log("engine.io/controller - client disconnected");
                    game.unJoin(gameSocket, socket);
                    if (gameSocket.readyState == WebSocket.OPEN) {
                        gameSocket.send('playerDisconnected');
                    }
                    game.freeGameSocket(gameSocket);
                });

				socket.on('error', function() {
                    require('util').error("engine.io/controller - connection error!");
				});
			}
			else {
                require('util').log("engine.io/controller - client trying to connect, no free slots, disconnecting");
				socket.close();
			}
		});
	};
}