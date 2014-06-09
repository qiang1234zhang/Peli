
    // BUGAA. Ensimmäinen termi sisältää <attributes> roinaa!
    function read_Node( node_Variables )
    {
        var node_Name;
        var node_Position;
        var node_Rotation
        var node_Scale;
        var node_Mesh = "NULL"
        
        
        node_Variables.forEach( function( variable )
        {
            
            if( variable.label == "Name"    ) node_Name     = variable;
            if( variable.label == "Position") node_Position = variable;
            if( variable.label == "Rotation") node_Rotation = variable; 
            if( variable.label == "Scale"   ) node_Scale    = variable;
            if( variable.label == "Mesh"    ) node_Mesh     = variable;
        
        });
        
    return [ node_Position, node_Rotation, node_Scale, node_Mesh, node_Name ];
    }
 
 
 
 
    function World( worldName )
    {
        var fullPath      = "/data/"+worldName+"/"+worldName+".irr";
        var parser        = new Parser( fullPath );
        var nodes         = parser.the_Document.get_Subfields("node");
        
        var triangleList  = [];
        
       
        
        for( var i = 0; i < nodes.length; i++ )
        {  
            var node                     = nodes[i];
            var node_Type                = node.get_Type();
           
            var node_Attributes          = node.get_Subfields("attributes");
            var node_Variables           = node_Attributes[0].get_Variables();                 
            
            var node_Description         = read_Node( node_Variables   );
            var node_Name                = node_Variables[0].value;         // HAX HAX HAX. node_Variables bugaa.
           
            var node_Position            = node_Description[0].casted();
            var node_Rotation            = node_Description[1].casted();
            var node_Scale               = node_Description[2].casted();
            
            var node_Transformation      = new Matrix44();
                node_Transformation      = node_Transformation.build_Transformation( node_Position  ,
                                                                                     node_Rotation  ,
                                                                                     node_Scale     ); 
           
            // Hijack special nodes here by Name. 
            // Detected special nodes will be handled separately,
            // and will never reach the triangle soup with the rest.
               
     //      if( node_Name == "Mesh1")
      //     {
     //          alert("ASS");
      //     }
           
           
            switch( node_Type ) 
            {
                 case "mesh":   
                    parse_Mesh( node, node_Description, node_Transformation, triangleList );
                 break;
               
                case "light": 
                break;
            
            default: console.info("Unknown Node encountered - Skipping: " + type );
            }
        }
      
    // UV should be fine here!
    
    this.quadTree =  new     QuadTree( triangleList   ); 
    this.shader   =  new SimpleShader(                );
    }
    
    
    
    
    World.prototype.render = function( camera )
    {
        the_Renderer.set_Shader( this.shader      );
        the_Renderer.set_Matrices( new Matrix44(), null, null );
        
        this.quadTree.render( camera.frustrum );
    }