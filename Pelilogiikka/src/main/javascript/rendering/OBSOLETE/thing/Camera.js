

    
    function Camera( renderer, near, far, verticalFov )     
    {
        this.orientation  = new Orientation( [0,0,0],  [1,1,1], [0,0,0] );
        this.verticalFov  = verticalFov;
        this.aspectRatio  = (renderer.gl.viewportWidth / renderer.gl.viewportHeight);
        this.nearPlane    = near;
        this.farPlane     = far;
    }

    Camera.prototype.get_ViewMatrix = function()
    {
        return this.orientation.get_InverseMatrix();
    }
    
    Camera.prototype.pitch = function( radians ) 
    {
       this.orientation.pitch( radians );
    }	

    Camera.prototype.yaw = function( radians )
    {
      this.orientation.yaw( radians );
    }

    Camera.prototype.roll = function( radians ) 
    {
      this.orientation.roll( radians );
    }
        
    Camera.prototype.forward = function( units )
    {
        var dir = this.orientation.get_Vector( "LOOK" );
            dir = dir.mul( -units );                            // Right handed -> negative Z is look                   
        this.orientation.displace( [dir.x,dir.y,dir.z] );
    };
  
    Camera.prototype.backward = function( units )
    {
        var dir = this.orientation.get_Vector( "LOOK" );
            dir = dir.mul( units );
        this.orientation.displace( [dir.x,dir.y,dir.z] );
    }
  
    Camera.prototype.set_Position = function( point )
    {
        this.orientation.set_Position( point );
    }
	
    Camera.prototype.move = function( displacement )
    {
        this.orientation.displace( displacement );
    }
  
   
    Camera.prototype.get_Position = function( point )
    {
      return this.orientation.get_Position();
    }
	
