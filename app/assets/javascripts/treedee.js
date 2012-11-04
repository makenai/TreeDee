// Disable selection
document.onselectstart = function() {
    return false;
};

$(function() {

    var camera, scene, renderer, effect, light;
    var geometry, material, mesh;
    var canvasWidth  = window.innerWidth,
        canvasHeight = window.innerHeight - 40,
        rotateX = 0,
        rotateY = 0,
        rotationXMouseDown = 0,
        rotationYMouseDown = 0,
        threedee = true;

    function getCentroid( mesh ) {
        mesh.geometry.computeBoundingBox();
        var boundingBox = mesh.geometry.boundingBox;

        var x0 = boundingBox.min.x;
        var x1 = boundingBox.max.x;
        var y0 = boundingBox.min.y;
        var y1 = boundingBox.max.y;
        var z0 = boundingBox.min.z;
        var z1 = boundingBox.max.z;

        var bWidth = ( x0 > x1 ) ? x0 - x1 : x1 - x0;
        var bHeight = ( y0 > y1 ) ? y0 - y1 : y1 - y0;
        var bDepth = ( z0 > z1 ) ? z0 - z1 : z1 - z0;

        var centroidX = x0 + ( bWidth / 2 ) + mesh.position.x;
        var centroidY = y0 + ( bHeight / 2 )+ mesh.position.y;
        var centroidZ = z0 + ( bDepth / 2 ) + mesh.position.z;

        var centroid = { x : centroidX, y : centroidY, z : centroidZ };

        return centroid;
    };

    function init( objectUrl ) {

        camera = new THREE.PerspectiveCamera( 75, canvasWidth / canvasHeight, 1, 1000 );
        camera.position.z = 100;

        scene = new THREE.Scene();

        // material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

        material = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });

        light = new THREE.DirectionalLight(0xFFFFFF);
        light.position.y = 20;
        scene.add(light);

        var loader = new THREE.JSONLoader();
        loader.load( objectUrl, function ( geometry ) {
    
            mesh = new THREE.Mesh( geometry, material );
            scene.add( mesh );

            // mesh.scale.x = mesh.scale.y = mesh.scale.z = mesh.boundRadius / 6;

            // light.position.z = camera.position.z = mesh.boundRadius * 1.8;
            light.position.z = camera.position.z;
            
        });

        // geometry = new THREE.CubeGeometry( 500, 200, 200 );

        // mesh = new THREE.Mesh( geometry, material );
        // scene.add( mesh );

        renderer = new THREE.WebGLRenderer();
        // renderer = new THREE.AnaglyphWebGLRenderer();

        renderer.setSize( canvasWidth, canvasHeight );
        effect = new THREE.AnaglyphEffect( renderer, canvasWidth, canvasHeight );

        document.getElementById('treedee').appendChild( renderer.domElement );

        animate();
    }

    function animate() {
        // note: three.js includes requestAnimationFrame shim
        requestAnimationFrame( animate );

        if ( typeof mesh != 'undefined' ) {
            mesh.rotation.x = rotationXMouseDown - rotateX;
            mesh.rotation.y = rotationYMouseDown - rotateY;
        }

        if ( threedee ) {
            effect.render( scene, camera );
        } else {
            renderer.render( scene, camera );
        }
    }

    if ( $('#treedee').length > 0 ) {
        init( modelToLoad );
        
        // React to window resizing
        $(window).smartresize(function() {
            canvasWidth  = window.innerWidth;
            canvasHeight = window.innerHeight - 40;
            renderer.setSize( canvasWidth, canvasHeight );
            effect.setSize( canvasWidth, canvasHeight );
            camera.aspect   = canvasWidth / canvasHeight;
            camera.updateProjectionMatrix();
        });
    }

    // Mouse Rotation Stuff

    var mouseDown = false,
        mouseDownX = 0,
        mouseDownY = 0;

    $(document).mousedown(function(e) {
        
        mouseDown = true;
        mouseDownX = e.clientX;
        mouseDownY = e.clientY;
        rotationXMouseDown = mesh.rotation.x,
        rotationYMouseDown = mesh.rotation.y;
        rotateY = rotateX = 0;

    }).mouseup(function(e) {

        mouseDown = false;

    }).mousemove(function(e) {

        if ( mouseDown ) {
            rotateY = ( e.clientX - mouseDownX ) * 0.02;
            rotateX = ( e.clientY - mouseDownY ) * 0.02;
        }

    });

    // Buttons

    $('#zoom-in').click(function(e) {
        e.preventDefault();
        $({ scale: mesh.scale.x }).animate( 
            { scale: mesh.scale.x + 0.20 },
            {
                duration: 150,
                easing: 'easeInOutQuint',
                step: function( now, fx ) {
                    mesh.scale.x = mesh.scale.y = mesh.scale.z = now;
                }
            }
        );
    })

    $('#zoom-out').click(function(e) {
        e.preventDefault();
        $({ scale: mesh.scale.x }).animate( 
            { scale: mesh.scale.x - 0.20 },
            {
                duration: 150,
                easing: 'easeInOutQuint',     
                step: function( now, fx ) {
                    mesh.scale.x = mesh.scale.y = mesh.scale.z = now;
                }
            }
        );
    })

    function moveMesh( property, amount ) {
        $({ scale: mesh.position[ property ] }).animate( 
            { scale: mesh.position[ property ] + amount },
            {
                duration: 150,
                easing: 'easeInOutQuint',     
                step: function( now, fx ) {
                    mesh.position[ property ] = now;
                }
            }
        );        
    }

    $('#pan-left').click(function(e) {
        e.preventDefault();
        moveMesh( 'x', -5 );
    });
    $('#pan-right').click(function(e) {
        e.preventDefault();
        moveMesh( 'x', 5 );
    });
    $('#pan-up').click(function(e) {
        e.preventDefault();
        moveMesh( 'y', 5 );
    });
    $('#pan-down').click(function(e) {
        e.preventDefault();
        moveMesh( 'y', -5 );
    });

    $(document).keydown(function(e){
        if (e.keyCode == 37)
           $('#pan-left').click();
        if (e.keyCode == 38)
           $('#pan-up').click();
        if (e.keyCode == 39)
           $('#pan-right').click();
        if (e.keyCode == 40)
           $('#pan-down').click();
        return false;
    });


    $('#print').click(function(e) {
        e.preventDefault();
        animate();
        var dataURL = renderer.domElement.toDataURL();
        var $img = $('<img />', { src: dataURL }).appendTo('#treedee');
        $('canvas').hide();
        window.print();
        $('canvas').show();
        $img.remove();
    });


    $('#threedee').click(function(e) {
        e.preventDefault();
        if ( threedee ) {
            $(this).addClass('off');
            threedee = false;
        } else {
            $(this).removeClass('off');
            threedee = true;
        }
    })


});