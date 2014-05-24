var client = client || {};

client.phone = {
    controllerDisabler: null,
    controllers: {},
    isOrienting: false,
    isResizing: false,
    rc: 0,
    oc: 0,
    canvas: null,
    container: null,
    texts: [],
    textIndexes: {},
    textLines: 0,

    onDocumentReady: function() {
        var self = client.phone;

        self.canvas = document.getElementById('canvas'); //$('#canvas');
        self.container = $('#container');

        var ctx = canvas.getContext("2d");

        log.info("trying to open connection");
        client.coms.open(self.onConnectionOpened);

        $(window).on("orientationchange", self.onOrientationChange);
        $(window).resize(self.onResize);

        self.onResize();
    },

    onOrientationChange: function() {
        var self = client.phone;

        if (self.isOrienting === false) {
            self.isOrienting = true;
            setTimeout(function() {
                self._oc++;
            }, 50);
        }
        self.isOrienting = false;
    },

    onResize: function() {
        var self = client.phone;

        if (self.isResizing === false) {
            self.isResizing = true;
            setTimeout(function() {
                self.rc++;
                var ios = navigator.userAgent.match(/(iPhone)|(iPod)/); // is iPhone

                if (ios) {
                    // increase height to get rid off ios address bar
                    $("#container").height($(window).height() + 60);
                }

                $("#canvas").attr('width', $("#container").width());
                $("#canvas").attr('height', $("#container").height());

                // hides the WebKit url bar
                if (ios) {
                    setTimeout(function() {
                        window.scrollTo(0, 1);
                    }, 100);
                }

                self.drawText('Orientiation changes: ' + self.oc++, 0);
                self.drawText('Resize events: ' + self.rc++, 1);
            }, 100);
            self.isResizing = false;
        }
    },

    onConnectionOpened: function() {
        var self = client.phone;
        client.coms.call('joinGame', [USERID], self,
            function(rpc_id, rpc_error, retval) {
                self.loadController(retval);
            });
    },



    drawText: function(text, textID) {
        var self = client.phone;

        if (typeof textID === 'undefined') {
            throw "peli.client.phone.drawText - needs a textID";
        }


        if (self.textIndexes[textID] === undefined) {
            self.textIndexes[textID] = self.textLines++;
            self.texts.push(null);
        }

        if (self.texts[self.textIndexes[textID]] != text) {
            self.texts[self.textIndexes[textID]] = text;
            self.draw();
        }
    },

    draw: function() {
        var self = client.phone;

        var width = self.canvas.width;
        var height = self.canvas.height;
        var canvasDimensions = [width, height];

        var ctx = self.canvas.getContext("2d");
        drawBackground(ctx);

        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';

        for (var i = 0; i < self.texts.length; i++) {
            ctx.fillText(self.texts[i],
                width / 2, (height / 2) + (i * 10));
        }

        function drawBackground(ctx) {
            ctx.fillStyle = 'green';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = 'black';
            ctx.fillRect(10, 10, width - 20, height - 20);
        }

        /*

        //Test code
        function updateStartTimeText(time) {
        drawText("Start time: " + time, 4);
        }

        //Test code
        function updateCurrentTimeText(time) {
        drawText("Current time: " + time, 5);
        }

        //Test code
        function updateStartCoordinatesText(x, y) {
        var canvasDimensions = getCanvasDimensions();

        drawText("Start coordinates: (" + x + ", " + y + ")", 6);
        }

        //Test code
        function updateSendTimeText(time) {
        drawText("Sent time: " + time, 7);
        }
        */
    },

    /**
     * @param {string} type - a generic name for the controller
     * @param {function} enabler - function that will be called to enable controller
     */
    registerController: function(type, enabler) {
        var self = client.phone;

        if (!self.controllers[type]) {
            self.controllers[type] = enabler;
        } else {
            throw new Error("Trying to register multiple controllers of type: " + type);
        }
    },

    loadController: function(type) {
        var self = client.phone;

        if (!self.controllers[type]) {
            throw new Error("trying to enable unregistered controller type: " + type);
        }

        if (typeof self.controllerDisabler === 'function') {
            self.controllerDisabler();
            self.controllerDisabler = null;
        }

        self.controllerDisabler = self.controllers[type](
            self.container,
            self.canvas,
            self.drawText);
    }
};

$(document).ready(client.phone.onDocumentReady);

/*

function getFingerCoords(id) {
   var canvas_x = event.targetTouches[id].pageX;
   var canvas_y = event.targetTouches[id].pageY;
   return [canvas_x, canvas_y];
}

function getRelativeCoords(id) {
   var coords = getFingerCoords(id);
   var canvasDimensions = getCanvasDimensions();
   var relativeX = coords[0] / canvasDimensions[0];
   var relativeY = coords[1] / canvasDimensions[1];
   return [relativeX, relativeY];
}
*/
