    // LOLZ XXX
    
    function Renderer( canvas )
    {
        this.gl            = null;
        this.camera        = null;
        this.canvas        = canvas;
        this.target_Width  = canvas.width;
        this.target_Height = canvas.height;
        
        try 
        {
            this.gl                = canvas.getContext("experimental-webgl");  // Wtf is the point of this label!?
            this.gl.viewportWidth  = canvas.width;
            this.gl.viewportHeight = canvas.height;
        } 
        catch (e) 
        {
            alert("Failed to initialize GL: " + e.message);
        }
        
        if( !this.gl ) message("Fatal error creating renderer");
       
       
     this.fillColor = [0.0,1.0,0.0,1.0];
     
     // These two belong into a separate CAMERA class!
     // Declare projection matrix
     this.projection_Matrix = mat4.create();
     mat4.identity( this.projection_Matrix );
     // Declare view matrix
     this.view_Matrix       = mat4.create();
     mat4.identity( this.view_Matrix       );
      
       
     this.gl.enable(this.gl.DEPTH_TEST );                   /// ELSEWHERE!    
       
     this.gl.frontFace ( this.gl.CW         );
     this.gl.enable    ( this.gl.CULL_FACE  );
     this.gl.cullFace  ( this.gl.BACK       );
     }


    Renderer.prototype.begin = function()
    { 
        this.gl.viewport  ( 0, 0, this.gl.viewportWidth, this.gl.viewportHeight                     );
        this.gl.clearColor( this.fillColor[0],this.fillColor[1],this.fillColor[2],this.fillColor[3] );
        this.gl.clear     ( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT                     );
        
        
        var haxProj = new Matrix44();
            haxProj = haxProj.perspective( this.canvas, 2.0, 500.0 );
            
          this.projection_Matrix = haxProj.toGLMatrix();
    //    mat4.perspective( this.camera.verticalFov, this.camera.aspectRatio, this.camera.nearPlane, this.camera.farPlane, this.projection_Matrix );
   
  
    
        // POTENTIAL HAX. How it will affect future operations, remains to be seen.
        mat4.scale( this.projection_Matrix, [-1,1,1], this.projection_Matrix ); // Mirror the projection matrix across X
    }

    Renderer.prototype.end = function()
    {
        // Postprocessing here
        
    }

    Renderer.prototype.draw = function(  myEntity , lights  )
    {
        var shaderProgram   = myEntity.material.shader.shaderProgram;
        var worldMatrix     = myEntity.orientation.get_Matrix();       
        var viewMatrix      = this.camera.get_ViewMatrix(); 
        var worldViewMatrix = mat4.multiply( viewMatrix , worldMatrix  );
     
        myEntity.material.bind( this.gl, this.gl.TEXTURE0, lights, this.camera );    // SLOT is OBSOLETE here!
        
      
        this.gl.uniformMatrix4fv( shaderProgram.pMatrixUniform , false,  this.projection_Matrix           );
        this.gl.uniformMatrix4fv( shaderProgram.mMatrixUniform , false,  worldMatrix                      );
        this.gl.uniformMatrix4fv( shaderProgram.mvMatrixUniform, false,  worldViewMatrix                  );
        
        myEntity.mesh.render_Indexed( this.gl, myEntity.material );
    }
     
     
     
     // NEEDS A DIFFERENT SHADER!
     Renderer.prototype.draw_SS = function( myEntity ) 
     {  
        var shaderProgram   = myEntity.material.shader.shaderProgram;
        var worldMatrix     = new Matrix44( ["ID"] ).toGLMatrix(); 
        
        this.gl.uniformMatrix4fv( shaderProgram.mvMatrixUniform, false,  worldMatrix );
        myEntity.material.bind( this.gl, this.gl.TEXTURE0, null, null );
      
         myEntity.render( this.gl );
     }
     
     
     
     
     
     Renderer.prototype.bind_Camera = function( cam )
     {
         if( !cam ) alert(" Invalid camera bound! ");
         this.camera = cam;
     }
     
     Renderer.prototype.set_BgrColor = function( color )
     {
        this.fillColor = color;
     }