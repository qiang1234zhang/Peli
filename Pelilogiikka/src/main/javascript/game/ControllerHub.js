var game = game || {};

game.controllerHub = {
    controllerType: CONTROLLER,
    ws_protocol: undefined, //JSONRPC_RPOTOCOL,
    ws_port: SCREEN_PORT,

    onPlayerJoined: null,
    onPlayerLeft: null,
    playerFactory: null,

    maxPlayers: 100,
    minimumFreeConnections: 2,
    freeConnections: 0,
    playerCount: 0,

    sequence: 0,
    players: {},
    controllers: {},

    //loadedControllerTypes: {},

/*
    registerController: function(name, controllerObject) {
        game.controllerHub.loadedControllerTypes[name] = controllerObject;
    },
    */

    update: function(time) {
        var self = game.controllerHub;
        for (var key in self.controllers) {
            self.controllers[key].update(time);
        }
    },

    openHub: function(onPlayerJoined, onPlayerLeft, playerFactory, maxPlayers) {
        var self = this;
        if (onPlayerJoined === undefined) console.error("onPlayerJoined undefined");
        if (onPlayerLeft === undefined) console.error("onPlayerLeft undefined");
        if (playerFactory === undefined) console.error("playerFactory undefined");
        if (!(playerFactory.getPlayer && playerFactory.freePlayer)) console.error("malformed playerFactory");
        if (!controller.loadedTypes[self.controllerType]) console.error("Controller not loaded", self.controllerType);
        self.controllerLoader = controller.loadedTypes[self.controllerType];

        self.onPlayerJoined = onPlayerJoined;
        self.onPlayerLeft = onPlayerLeft;
        self.playerFactory = playerFactory;
        self.maxPlayers = maxPlayers;

        if (!openConnection()) console.error("unable to open first connection");

        function openConnection() {
            if ((self.freeConnections >= self.minimumFreeConnections) || self.playerCount == self.maxPlayers) {
                return false;
            }

            var connection = new ConnectionWebsocket(location.hostname, self.ws_port, self.ws_protocol, true);
            // TODO recycle PeliRPC object
            var rpc = new PeliRPC(connection);
            var sequence = self.sequence++;

            rpc.exposeRpcMethod('joinGame', this, function(userID) {
                var player = self.playerFactory.getPlayer(userID);
                try {
                    var controller = self.controllerLoader.getController(player, rpc);
                    self.playerCount++;
                    self.freeConnections--;
                    self.controllers[sequence] = controller;
                    self.players[sequence] = player;
                } catch (e) {
                    console.error("Error while loading controller", self.controllerType);
                }

                openConnection();

                var playerData = self.onPlayerJoined(player, controller);
                console.info("Player joined game with userID ", userID, "controllerType is ", self.controllerType);
                return [self.controllerType, playerData];
            });

            connection.connect(function(error, ok) {
                    // onConnection
                    if (error === null) {
                        self.freeConnections++;
                        console.log("New connection successfully opened, total connecitons: ", self.freeConnections + self.playerCount);
                        openConnection();
                    } else {
                        console.warn("Connection error ", error);
                    }
                },
                function() { // onClose
                    if (self.controllers[sequence]) {
                        console.info("player disconnected, closing connection ");
                        var player = self.players[sequence];

                        self.loadedControllerTypes[self.controllerType].freeController(self.controllers[sequence]);
                        self.playerFactory.freePlayer(player);

                        delete self.controllers[sequence];
                        delete self.players[sequence];
                        self.onPlayerLeft(player, controller);
                        // TODO recycle PeliRPC object
                        self.playerCount--;

                    } else {
                        console.warn("connection unexpectedly closed ");
                    }
                },
                rpc.getOnMessage()
            );
            return true;
        }
    }
};
