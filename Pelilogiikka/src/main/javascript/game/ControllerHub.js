var game = game || {};

game.controllerHub = {
    ws_protocol: undefined, //JSONRPC_RPOTOCOL,
    ws_port: SCREEN_PORT,
    onPlayerJoined: null,
    onPlayerLeft: null,
    maxControllers: 100,
    minFreeControllers: 2,

    controllerType: CONTROLLER,
    controllerCount: 0,
    controllers: [],
    controllersFree: 0,

    openHub: function(onPlayerJoined, onPlayerLeft, maxPlayers) {
        var self = this;
        if (onPlayerJoined === undefined) throw new Error("Need to supply at least a onPlayerJoined callback");
        self.onPlayerJoined = onPlayerJoined;
        self.onPlayerLeft = onPlayerLeft;
        self.max = maxPlayers;
        createNewController();

        function createNewController() {
            if ((self.controllersFree >= self.minFreeControllers) || self.controllerCount == self.max) {
                return;
            }

            log.info("Creating and connecting new Controller");
            // TODO move all the connection stuff here instead of in PeliRPC.
            // will have to wait since it requires rewrite of PeliRPC.
            var connection = new ConnectionWebsocket(location.hostname, self.ws_port, self.ws_protocol, true);

            var rpc = new PeliRPC(connection);
            var controller = game.controller.create(rpc);

            rpc.exposeRpcMethod('joinGame', this, function(userID) {
                console.info("Player joined with userID ", userID);

                var player = playerFactory.getPlayer(userID);
                controller.setPlayer(player, self.controllerType);
                self.onPlayerJoined(player);

                createNewController();
                return self.controllerType;
            });

            connection.connect(function() {
                    // onConnection
                    self.controllerCount++;
                    self.controllersFree++;
                    console.log("Controller successfully connected ", self.controllerCount);
                    createNewController();
                }, function() {
                    // onClose
                    self.controllerCount--;
                    console.log("Controller disconnected, now have a total of ", self.controllerCount);
                },
                rpc.getOnMessage(),
                function() {
                    // onPlayerDisconnected

                    controller.freePlayer();
                    self.onPlayerLeft(controller.clearPlayer());
                });
        }
    }
};
