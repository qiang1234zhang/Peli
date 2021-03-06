//  LeftPoint-----------RightPoint
//           \         /
//            \       /
//             \     /
//              \   /
//               \ /
//              Origin

function ViewTriangle (origin3, look3, lTrans, rTrans, farPlaneDist)
{
    this.look = new Vector2(look3.x, look3.z).normalized();
    var leftU = lTrans.transform(this.look);
    var rightU = rTrans.transform(this.look);
    var farLook = this.look.multiply(farPlaneDist);
    var left_Side = leftU.multiply(farPlaneDist);//farLook.projected( leftU  );
    var right_Side = rightU.multiply(farPlaneDist); //farLook.projected( rightU );
    this.origin = new Vector2(origin3.x, origin3.z);
    this.left = this.origin.add(left_Side);
    this.right = this.origin.add(right_Side);
}

ViewTriangle.prototype.contains = function (aabr)
{
    var p1 = this.origin;
    var p2 = this.left;
    var p3 = this.right;
    var testDir = new Vector2(1, 0);
    var points_Inside = 0;
    for (var i = 0; i < aabr.points.length; i++)
    {
        var testRay = new Ray2(aabr.points[i], testDir);
        var hits = 0;
        if (testRay.intersects(p1, p2))
            hits++;
        if (testRay.intersects(p2, p3))
            hits++;
        if (testRay.intersects(p3, p1))
            hits++;

        if (hits != 0)
            if (!(hits % 2))
                points_Inside++;    // Simple triangle - No intersections. One intersection - Two intersections
    }
    //console.info( points_Inside );
    return points_Inside;
}

ViewTriangle.prototype.alert = function ()
{
    alert("Viewtriangle");
    this.origin.alert();
    this.left.alert();
    this.right.alert();
}

function Camera (position)
{
    this.position = position;
    this.orientation = new Matrix33();
    this.vertical_Fov = 35;
    this.aspectRatio = the_Renderer.gl.viewportWidth / the_Renderer.gl.viewportHeight;
    this.nearPlane = 1.0;
    this.farPlane = 2500;

    // vFov / yRes  = hFov / xRes
    // vFov*xRes/yRes = hFov

    // Parameters to make viewTriangle creation faster
    this.fov = this.vertical_Fov * this.aspectRatio; // Does this even make sense? ~ w/h = fov_V / fov_H 
    this.lTrans = new Matrix22();
    this.rTrans = new Matrix22();

    this.lTrans.Rotation(DegToRad(this.fov / 2));
    this.rTrans.Rotation(DegToRad(-this.fov / 2));

    this.rebuild_Frustrum();
}

Camera.prototype.rebuild_Frustrum = function ()
{
    this.frustrum = new ViewTriangle(this.position,
        this.orientation.extract_K().normalized(),
        this.lTrans,
        this.rTrans,
        this.farPlane);


    var string = "Created a frustrum: ";
    string += "\nLEFT: < " + Math.floor(this.frustrum.left.x) + " , " + Math.floor(this.frustrum.left.y) + " > ";
    string += "\nRIGHT: < " + Math.floor(this.frustrum.right.x) + " , " + Math.floor(this.frustrum.right.y) + " > ";
    string += "\nORIGIN: < " + Math.floor(this.frustrum.origin.x) + " , " + Math.floor(this.frustrum.origin.y) + " > ";

    //console.info( string );
}

Camera.prototype.forward = function (amount)
{
    var look = this.orientation.extract_K();
    this.position = this.position.add(look.multiply(-amount));
}

Camera.prototype.backwards = function (amount)
{
    var look = this.orientation.extract_K();
    this.position = this.position.add(look.multiply(amount));
}

Camera.prototype.up = function (amount)
{
    var look = this.orientation.extract_J();
    this.position = this.position.add(look.multiply(amount));
}

Camera.prototype.down = function (amount)
{
    var look = this.orientation.extract_J();
    this.position = this.position.add(look.multiply(-amount));
}

Camera.prototype.yaw = function (amount)
{
    var rotMatrix = new Matrix33();
    rotMatrix.RotationY(DegToRad(amount));
    this.orientation = this.orientation.multiply(rotMatrix);
}

Camera.prototype.pitch = function (amount)
{
    var rotMatrix = new Matrix33();
    rotMatrix.RotationX(DegToRad(amount));
    this.orientation = this.orientation.multiply(rotMatrix);
}

Camera.prototype.roll = function (amount)
{
    var rotMatrix = new Matrix33();
    rotMatrix.RotationZ(DegToRad(amount));
    this.orientation = this.orientation.multiply(rotMatrix);
}


Camera.prototype.get_ViewMatrix = function ()
{
    this.rebuild_Frustrum();  // Kinda hax it here
    var ret = new Matrix44();
    ret.embed(this.orientation.transposed());
    var lol = new Matrix44();
    lol.data[ 12 ] = -this.position.x;
    lol.data[ 13 ] = -this.position.y;
    lol.data[ 14 ] = -this.position.z;
    return ret.multiply(lol);
}



Camera.prototype.get_ProjectionMatrix = function ()
{
    var ret = new Matrix44();
    var top = this.nearPlane * Math.tan(this.vertical_Fov * Math.PI / 360.0);
    var right = top * this.aspectRatio;
    var left = -right;
    var bottom = -top;
    var near = this.nearPlane;
    var far = this.farPlane;
    var rl = (right - left);
    var tb = (top - bottom);
    var fn = (far - near);
    ret.data[0 ] = (near * 2) / rl;
    ret.data[1 ] = 0;
    ret.data[2 ] = 0;
    ret.data[3 ] = 0;
    ret.data[4 ] = 0;
    ret.data[5 ] = (near * 2) / tb;
    ret.data[6 ] = 0;
    ret.data[7 ] = 0;
    ret.data[8 ] = (right + left) / rl;
    ret.data[9 ] = (top + bottom) / tb;
    ret.data[10] = -(far + near) / fn;
    ret.data[11] = -1;
    ret.data[12] = 0;
    ret.data[13] = 0;
    ret.data[14] = -(far * near * 2) / fn;
    ret.data[15] = 0;

    // Mirror the projection matrix along X
    var mirror = new Matrix44([-1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1]);
    ret = ret.multiply(mirror);
    return ret;
}

/*
 
 mat4.perspective = function(fovy, aspect, near, far, dest) {
 var top = near*Math.tan(fovy*Math.PI / 360.0);
 var right = top*aspect;
 return mat4.frustum(-right, right, -top, top, near, far, dest);
 };
 
 mat4.frustum = function(left, right, bottom, top, near, far, dest) {
 if(!dest) { dest = mat4.create(); }
 var rl = (right - left);
 var tb = (top - bottom);
 var fn = (far - near);
 dest[0] = (near*2) / rl;
 dest[1] = 0;
 dest[2] = 0;
 dest[3] = 0;
 dest[4] = 0;
 dest[5] = (near*2) / tb;
 dest[6] = 0;
 dest[7] = 0;
 dest[8] = (right + left) / rl;
 dest[9] = (top + bottom) / tb;
 dest[10] = -(far + near) / fn;
 dest[11] = -1;
 dest[12] = 0;
 dest[13] = 0;
 dest[14] = -(far*near*2) / fn;
 dest[15] = 0;
 return dest;
 };
 
 */