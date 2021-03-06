var controller = controller || {};

controller.loadedTypes = controller.loadedTypes || [];
controller.loadedTypes.Swipe = {
    getController: function(player, rpc) {
        return new controller.Swipe(player, rpc);
    },
    freeController: function(controller) {

    },
};

controller.Swipe = function(player, rpc) {
    this.reset(player, rpc);
}

controller.Swipe.prototype.clear = function() {
    this.player = null;
};


controller.Swipe.prototype.reset = function(player, rpc) {
    rpc.exposeRpcMethod('swipe', this, this.pushSwipe);

    this.player = player;
    this.x = 0.5;
    this.y = 0.5;
    this.lastSwipe = null;
    this.startCoords = null;
    this.previousDirection = null;
    this.posChangeMul = 0.01;
    this.currentDirection = new Vector2(0, 0);
    this.interpolator = new Interpolator(1, 0);
    this.time = 0;
    this.previousTime = 0;
    this.delta = 0.01;
};


controller.Swipe.prototype.update = function(time) {
    //console.debug("updating swipe");

    if (this.lastSwipe != null) {
        //console.debug("Controller update");
        var coords = this.lastSwipe[0];
        //Swipe start
        if (this.lastSwipe[1]) {
            this.startCoords = coords;
            //this.previousDirection = null;
            this.previousTime = 0;
            this.calcNewPosition(time);
        } else {
            if (this.startCoords != null) {
                this.calcNewDirection(this.startCoords, coords, time);
            }
            this.startCoords = coords;
        }
    } else {
        this.calcNewPosition(time);
    }
};

controller.Swipe.prototype.pushSwipe = function(x, y, isStart) {
    this.lastSwipe = [
        [x, y], isStart
    ];
    //log.debug("Pushed swipe: (" + x + ", " + y + ")" + ", " + sincePrevious);
};

controller.Swipe.prototype.setPosition = function(x, y) {
    if (!(x > 1 || x < 0)) {
        this.x = x;
    }
    if (!(y > 1 || y < 0)) {
        this.y = y;
    }

    this.player.setPosition(this.x, this.y);
};

controller.Swipe.prototype.calcNewPosition = function(timestamp) {
    if (this.currentDirection.length() <= 0.001) {
        return;
    }
    if (this.time > 1) {
        return;
    }
    
    var addition = 0;
    if (this.previousTime === 0) {
        addition = this.delta;
    } else {
        addition = (timestamp - this.previousTime) * (this.delta / 100);
    }
    this.time += addition;
    
    this.previousTime = timestamp;
    
    var speedMultiplier = this.interpolator.interpolate(this.time);
    //log.debug(this.time + " " + speedMultiplier);
    this.currentDirection = this.currentDirection.multiply(speedMultiplier);
    var newX = this.x + this.currentDirection.x * this.posChangeMul;
    var newY = this.y + this.currentDirection.y * this.posChangeMul;
    this.setPosition(
            newX,
            newY);
    //console.debug("New pos: (" + newX + ", " + newY + ")");
};

/**
 * 
 * @param {type} beginning  beginning[0] = start x coordinate, 
 * beginning[1] = start y coordinate
 * 
 * @param {type} end    end[0] = end x coordinate, end[1] = end y coordinate
 * @returns {undefined}
 */
controller.Swipe.prototype.calcNewDirection = function(beginning, end, timestamp) {
    //log.debug("BEGINNING: " + beginning[0] + ", " + beginning[1] + " END: " + end[0] + ", " + end[1]);
    var startPos = new Vector2(beginning[0], beginning[1]);
    var endPos = new Vector2(end[0], end[1]);
    var newVec = endPos.subtract(startPos);
    //log.debug("newVec: (" + newVec.x + ", " + newVec.y + ")", true);
    
    if (newVec.length() < 0.01) {
        this.calcNewPosition(timestamp);
        return;
    }

    if (this.previousDirection === null) {
        this.previousDirection = newVec;
        this.currentDirection = newVec;
        this.time = 0;
    } else {
        var newDirection = this.currentDirection.add(newVec);
        //log.debug("Current direction: (" + this.currentDirection.x + ", " + this.currentDirection.y + ")");
        //log.debug("newVec: (" + newVec.x + ", " + newVec.y + "), newDirection: (" + newDirection.x + ", " + newDirection.y + ")");
        this.previousDirection = newDirection;
        this.currentDirection = newDirection;
        this.time = 0;

        var newX = this.x + newVec.x * this.posChangeMul;
        var newY = this.y + newVec.y * this.posChangeMul;

        this.setPosition(newX, newY);
        //log.info("Vector: (" + newVec.x + ", " + newVec.y + ")");
        //console.debug("New position: " + newX + ", " + newY + ")");
    }

    this.lastSwipe = null;
};