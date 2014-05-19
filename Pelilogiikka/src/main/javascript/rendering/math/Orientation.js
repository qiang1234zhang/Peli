
    function Orientation( position, scales, angles )
    {
      this.position_V = new Vector3( position[0] , position[1], position[2] );
      this.scales_V   = new Vector3(   scales[0] ,   scales[1],   scales[2] );
      this.angles_V   = new Vector3(   angles[0] ,   angles[1],   angles[2] );
    }
    
    
    Orientation.prototype.set_Position = function( position )
    {
        this.position_V = new Vector3( position[0] , position[1], position[2] );
    }
   
    Orientation.prototype.set_Rotation = function( rotation )
    {
        this.angles_V   = new Vector3(   rotation[0] , rotation[1], rotation[2] );
    }
    
    Orientation.prototype.set_Scale = function( scales )
    {
        this.scales_V   = new Vector3(   scales[0] ,   scales[1],   scales[2] );
    }
    
    
    
    Orientation.prototype.displace = function( displacement ) 
    {
          this.position_V = this.position_V.add( new Vector3( displacement[0],displacement[1],displacement[2] ));
    }

    Orientation.prototype.pitch = function( radians )
    {
        this.angles_V.x += radians;
    }
    
    Orientation.prototype.yaw   = function( radians )
    {
        this.angles_V.y += radians;
    }

    Orientation.prototype.roll   = function( radians )
    {
        this.angles_V.z  += radians;  
    }
    
    Orientation.prototype.scale = function( axes )
    {
         this.scales_V   = new Vector3(   axes[0] ,   axes[1],   axes[2] );
    }
    

    Orientation.prototype.get_Matrix = function() 
    {
        var       final = new Matrix44( ["TRANS",this.position_V] );           // Declare a fresh matrix and apply translation
        var           I = new Vector3( 1, 0, 0 );
        var matrix_rotI = new Matrix44( ["ROT_A", I , this.angles_V.x ]);
                  final = final.multiply( matrix_rotI );                        // Rotate around the models I-axis
        var           J = new Vector3( final.m12, final.m22,  final.m32 );
        var matrix_rotJ = new Matrix44( ["ROT_A", J , this.angles_V.y  ]);
                  final = final.multiply( matrix_rotJ );                        // Rotate around the models new J-axis
        var           K = new Vector3( final.m13, final.m23, final.m33 );
        var matrix_rotK = new Matrix44( ["ROT_A", K , this.angles_V.z  ]);
                  final = final.multiply( matrix_rotK );                        // Rotate around the models new K-axis
        var      scalez = new Matrix44( ["SCALE", this.scales_V] );             // Apply scale
                  final = final.multiply( scalez );
        
    return new MatrixGL( final );
    }
    
    
    
    
    
    
    
 
    // KUSEE
    Orientation.prototype.get_InverseMatrix = function()
    {
       var matrix = mat4.create();
                    mat4.identity( matrix );
        
        var iX = matrix[0]; // 0,1,2,3
        var iY = matrix[4]; // 4,5,6,7
        var iZ = matrix[8]; // 8,9,a,b
        
        mat4.rotate( matrix, -this.angles_V.x, [iX, iY, iZ], matrix );
        
        var jX = matrix[1 ]; // 0,1,2,3
        var jY = matrix[5 ]; // 4,5,6,7
        var jZ = matrix[9 ]; // 8,9,a,b
        
        mat4.rotate(matrix, - this.angles_V.y, [jX, jY, jZ], matrix );
        
        var kX = matrix[2 ]; // 0,1,2,3
        var kY = matrix[6 ]; // 4,5,6,7
        var kZ = matrix[10]; // 8,9,a,b
        
        mat4.rotate(matrix,  -this.angles_V.z, [kX, kY, kZ], matrix );   
         
        mat4.translate(matrix, [ -this.position_V.x, 
                                 -this.position_V.y, 
                                 -this.position_V.z  ]);
    return matrix;
    }
    
    
    // 0,1,2,3
    // 4,5,6,7
    // 8,9,A,B
    // C,D,E,F
    Orientation.prototype.get_Vector = function( label )
    {
      var matrix = mat4.create();
                   mat4.identity( matrix );
                   mat4.rotate(matrix, this.angles_V.x, [1, 0, 0] );
                   mat4.rotate(matrix, this.angles_V.y, [0, 1, 0] );
                   mat4.rotate(matrix, this.angles_V.z, [0, 0, 1] );
        
        if( label === "LOOK")
        {
            return new Vector3(  matrix[8], matrix[9], matrix[10] );
        }
        else
            if( label == "UP")
            {
                return new Vector3( matrix[4], matrix[5], matrix[6] );
            }
            else
                if( label == "RIGHT")
                {
                    return new Vector3( matrix[0], matrix[1], matrix[3] );
                }
                else
                    alert(" Bad vector label: ("+label+")");
        
        
    }
    
    
    
    /*
     * 
     * 
     // Legacy implementation of orientation
    Orientation.prototype.get_Matrix = function() 
    {
        var matrix = mat4.create();
                     mat4.identity( matrix  );
                
         mat4.translate( matrix, [  this.position[0], 
                                    this.position[1], 
                                    this.position[2] ] );
     
        mat4.rotate(matrix, this.angles[0], [1, 0, 0], matrix );
       
        var jX = matrix[1]; // 0,1,2,3
        var jY = matrix[5]; // 4,5,6,7
        var jZ = matrix[9]; // 8,9,a,b
       
        mat4.rotate(matrix, this.angles[1], [jX, jY, jZ], matrix );
        
        var kX = matrix[2];  // 0,1,2,3
        var kY = matrix[6];  // 4,5,6,7
        var kZ = matrix[10]; // 8,9,a,b
        
        
        mat4.rotate(matrix, this.angles[2], [kX, kY, kZ], matrix );    
  
        mat4.scale( matrix, this.scales, matrix );
        
    return matrix;
    }
     */