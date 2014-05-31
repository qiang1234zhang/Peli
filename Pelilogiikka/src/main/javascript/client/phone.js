/*jslint browser: true*/
/*global console: false*/
/*global $: false*/
/*global USERID: false*/
/*global controller: false*/
var client = client || {};

client.phone = {
    ios: false, /* is iPhone */
    controllerDisabler: null,
    isOrienting: false,
    isResizing: false,
    rc: 0,
    oc: 0,
    controllerView: null,
    onDocumentReady: function () {
        "use strict";

        this.io = navigator.userAgent.match(/(iPhone)|(iPod)/);

        this.controllerView = client.controllerView.create(
            document.getElementById('container'),
            document.getElementById('canvas')
        );
        this.onResize();

        this.controllerView.add(new graphics2d.fpsDisplay.create(document.getElementById("canvas")));

        client.coms.open(this.onConnectionOpened);

        $(window).on("orientationchange", this.onOrientationChange.bind(this));
        $(window).resize(this.onResize.bind(this));

        this.controllerView.start();
    },
    onOrientationChange: function () {
        "use strict";
        var self = this;

        if (this.isOrienting === false) {
            this.isOrienting = true;
            this._oc += 1;
            setTimeout(function () {
                self.controllerView.onOrientationChange();
                self.isOrienting = false;
            }, 50);
        }
    },
    onResize: function () {
        "use strict";
        var self = this;

        if (this.isResizing === false) {
            this.isResizing = true;
            this.rc += 1;
            setTimeout(function () {
                var ios = navigator.userAgent.match(/(iPhone)|(iPod)/); // is iPhone

                if (ios) {
                    // increase height to get rid off ios address bar
                    $("#container").height($(window).height() + 60);

                    // hides the WebKit url bar
                    setTimeout(function () {
                        window.scrollTo(0, 1);
                    }, 100);
                }

                self.controllerView.onResize();
                self.isResizing = false;

            }, 100);
        }
    },
    onConnectionOpened: function () {
        "use strict";
        var self = client.phone;
        client.coms.call('joinGame', [USERID], self,
            function (rpc_id, rpc_error, retval) {
                self.loadController(retval[0], retval[1]);
            });
    },
    addDrawable: function (drawable) {
        "use strict";
        this.controllerView.add(drawable);
    },
    setControllerInfo: function (lines) {
        "use strict";
        this.controllerLines = lines;
    },
    /*
     registerController: function (type, enabler) {
     "use strict";
     var self = client.phone;
     
     if (!self.controllers[type]) {
     self.controllers[type] = enabler;
     } else {
     throw new Error("Trying to register multiple controllers of type: " + type);
     }
     },
     */
    loadController: function (type, crosshair) {
        "use strict";

        if (!controller.loadedTypes[type]) {
            console.error("trying to enable unregistered controller type ", type);
            throw new Error("trying to enable unregistered controller type: " + type);
        }

        this.controllerView.add(controller.loadedTypes[type]);
        this.controllerView.showCrosshair(crosshair);

        if (typeof self.controllerDisabler === 'function') {
            self.controllerDisabler();
            self.controllerDisabler = null;
        }

        self.controllerDisabler = controller.loadedTypes[type](
            document.getElementById('container'),
            document.getElementById('canvas'),
            this,
            client.coms,
            crosshair);
    },
    getFingerCoords: function (id, event) {
        var canvas_x = event.targetTouches[id].pageX;
        var canvas_y = event.targetTouches[id].pageY;
        return [canvas_x, canvas_y];
    },
    getRelativeCoords: function (id, event) {
        var coords = this.getFingerCoords(id, event);
        var canvasDimensions = this.getCanvasDimensions();
        var relativeX = coords[0] / canvasDimensions[0];
        var relativeY = coords[1] / canvasDimensions[1];
        return [relativeX, relativeY];
    },
    getCanvasDimensions: function () {
        canvas = document.getElementById("canvas");
        width = canvas.width;
        height = canvas.height;

        return [width, height];
    },
    updateCoordinatesText: function (x, y) {
        var canvasDimensions = getCanvasDimensions();

        phone.setControllerInfo(
            "Coordinates: (" + x + ", " + y + ")",
            "Canvas width: " + canvasDimensions[0] + "\nCanvas height: " + canvasDimensions[1]
            );
    },
};

$(document).ready(client.phone.onDocumentReady.bind(client.phone));
