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

    function loading( busy ) {
        if ( busy ) {
            $('#loading').show();
            $('#tools').hide();
        } else {
            $('#loading').hide();
            $('#tools').show();
        }
    }

    function centerDialogs() {
        $('#loading').css({
            top: ( window.innerHeight / 2 ) - 200,
            left: ( window.innerWidth / 2 ) - 102,
        });
    }
    centerDialogs();

    function d2r(degree) { 
        return degree*(Math.PI/180);
    };

    function r2d(radians) { 
        var degrees = ( radians * (180/Math.PI) ) % 360;
        if ( degrees < 0 )
            degrees += 360;
        return degrees;
    };

    function init( objectUrl ) {

        camera = new THREE.PerspectiveCamera( 70, canvasWidth / canvasHeight, 1, 100000 );
        camera.position.z = 100;

        scene = new THREE.Scene();

        // material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

        material = new THREE.MeshPhongMaterial({ color: 0xAAAAAA, shininess: 100 });


        var ambient = new THREE.AmbientLight( 0x050505 );
        scene.add( ambient );

        light = new THREE.PointLight(0xFFFFFF, 1.2);
        light.position.y = 20;
        scene.add(light);

        loading( true );
        var loader = new THREE.JSONLoader();
        loader.load( objectUrl, function ( geometry ) {
    
            mesh = new THREE.Mesh( geometry, material );
            scene.add( mesh );


            // console.log( 90 / mesh.boundRadius );

            mesh.scale.x = mesh.scale.y = mesh.scale.z = 70 / mesh.boundRadius;

            // light.position.z = camera.position.z = mesh.boundRadius * 1.8;
            light.position.z = camera.position.z - 10;
    
            loading( false );
        });

        try {
            renderer = new THREE.WebGLRenderer();    
        } catch( err ) {
            alert("Oops. Your browser doesn't support WebGL! We've disabled the analglyphic effect " +
                  "and your performance will be worse than normal. For the best experience, please try " +
                  "a recent version of Chrome or Firefox.");
            renderer = new THREE.CanvasRenderer();
            threedee = false;
            $('#threedee').addClass('off');
        }
        
        renderer.setSize( canvasWidth, canvasHeight );
        effect = new THREE.AnaglyphEffect( renderer, canvasWidth, canvasHeight );

        document.getElementById('treedee').appendChild( renderer.domElement );

        animate();
    }

    function animate() {
        // note: three.js includes requestAnimationFrame shim
        requestAnimationFrame( animate );

        if ( threedee ) {
            effect.render( scene, camera );
        } else {
            renderer.render( scene, camera );
        }
    }

    // Mouse Rotation Stuff

    var mouseDown = false,
        mouseDownX = 0,
        mouseDownY = 0;

    $(document).mousedown(function(e) {
        
        if ( e.target.tagName != 'CANVAS' )
            return;

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

            mesh.rotation.x = rotationXMouseDown - rotateX;
            $( "#x-slider" ).slider({ value: r2d( mesh.rotation.x ) });

            mesh.rotation.y = rotationYMouseDown - rotateY;
            $( "#y-slider" ).slider({ value: r2d( mesh.rotation.y ) });
        }
    });

    // Buttons

    $('#zoom-in').click(function(e) {
        e.preventDefault();
        $({ scale: mesh.scale.x }).animate( 
            { scale: mesh.scale.x + 0.15 },
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
            { scale: mesh.scale.x - 0.15 },
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
            centerDialogs();
        });
 
        $(document).keydown(function(e){
            if (e.keyCode == 37) {
               $('#pan-left').click();
               return false;
            }
            if (e.keyCode == 38) {
               $('#pan-up').click();
               return false;
            }
            if (e.keyCode == 39) {
               $('#pan-right').click();
               return false;
            }
            if (e.keyCode == 40) {
               $('#pan-down').click();
               return false;
            }
            if (e.keyCode == 189) {
               $('#zoom-out').click();
               return false;
            }
            if (e.keyCode == 187) {
               $('#zoom-in').click(); 
               return false;
            }
        });

    }

    $('#swatches a').click(function(e) {
        e.preventDefault();
        var color = $(this).data('color');
        mesh.material.color.setHex( parseInt( '0x' + color ) );
        $('#material').css( 'background-color', '#' + color );
    });

    $('#print').click(function(e) {
        e.preventDefault();
        loading( true );
        animate();
        var dataURL = renderer.domElement.toDataURL();
        $.post('/objects/' + modelUUID + '/snapshot', {
            data: dataURL,
            type: 'print'
        }, function( data ) {
            loading( false );
            $('canvas').hide();
            var $img = $('<img />', { src: dataURL }).appendTo('#treedee');
            $img.load(function() {
                window.print();
                $('canvas').show();
                $img.remove();
            }).error(function() {
                $('canvas').show();
                $img.remove();
                alert('Sorry, could not load image to print.');
            });
            
        });
    });

    $('#image').click(function(e) {
        e.preventDefault();
        loading( true );
        animate();
        var dataURL = renderer.domElement.toDataURL();
        $.post('/objects/' + modelUUID + '/snapshot', {
            data: dataURL,
            type: 'image'
        }, function( data ) {
            loading( false );
            window.location = data.url;
        });
    });    

    // Material selectors

    var materialTimeout;
    $('#material').click(function(e) {
        e.preventDefault();
        if ( $('#material-selector').is(":visible") ) {
            $('#material-selector').fadeOut();
        } else {
            $('#position-settings').hide();
            $('#material-selector').fadeIn();
            materialTimeout = setTimeout(function() {
                $('#material-selector').fadeOut();    
            }, 1500);            
        }
    });
    $('#material-selector').on('mouseleave', function() {
        materialTimeout = setTimeout(function() {
            $('#material-selector').fadeOut();
        }, 500);
    }).on('mouseenter', function() {
        clearTimeout( materialTimeout );
    }).on();

    // Sliders and stuff..

    var positionTimeout,
        sliding = false;
    $('#position').click(function(e) {
        e.preventDefault();
        if ( $('#position-settings').is(":visible") ) {
            $('#position-settings').fadeOut();
        } else {
            $('#material-selector').hide();
            $('#position-settings').fadeIn();
            positionTimeout = setTimeout(function() {
                $('#position-settings').fadeOut();    
            }, 1500);            
        }
    });
    $('#position-settings').on('mouseleave', function(e) {
        if ( sliding ) {
            return;
        }
        positionTimeout = setTimeout(function() {
            $('#position-settings').fadeOut();
        }, 500);
    }).on('mouseenter', function() {
        clearTimeout( positionTimeout );
    }).on('mousedown', function() {
        sliding = true;
        $(document).one('mouseup', function() {
            sliding = false;
        });
    });

    $('#x-slider').slider({ min: 0, max: 360, slide: function( e, ui ) {
        mesh.rotation.x = d2r( ui.value );
        $('#x-label').val( ui.value );
    }, change: function( e, ui ) { $('#x-label').val( ui.value ); }});
    $('#x-label').change(function(e) {
        $( "#x-slider" ).slider({ value: $(this).val() });
        mesh.rotation.x = d2r( $(this).val() );
    });

    $('#y-slider').slider({ min: 0, max: 360, slide: function( e, ui ) {
        mesh.rotation.y = d2r( ui.value );
        $('#y-label').val( ui.value );
    }, change: function( e, ui ) { $('#y-label').val( ui.value ); }});
    $('#y-label').change(function(e) {
        $( "#y-slider" ).slider({ value: $(this).val() });
        mesh.rotation.y = d2r( $(this).val() );
    });
    
    $('#z-slider').slider({ min: 0, max: 360, slide: function( e, ui ) {
        mesh.rotation.z = d2r( ui.value );
        $('#z-label').val( ui.value );
    }, change: function( e, ui ) { $('#z-label').val( ui.value ); }});
    $('#z-label').change(function(e) {
        $( "#z-slider" ).slider({ value: $(this).val() });
        mesh.rotation.z = d2r( $(this).val() );
    });

    $('#focal-length-slider').slider({ min: 1, max: 220, value: 125, slide: function( e, ui ) {
        effect.setFocalLength( ui.value );
        $('#focal-length-label').val( ui.value );
    }, change: function( e, ui ) { $('#focal-length-label').val( ui.value ); }});   
    $('#focal-length-label').val( 125 ); 
    $('#focal-length-label').change(function(e) {
        $( "#focal-length-label" ).slider({ value: $(this).val() });
        effect.setFocalLength( $(this).val() );
    });


    $('#threedee').click(function(e) {
        e.preventDefault();
        if ( renderer instanceof THREE.WebGLRenderer ) {
            if ( threedee ) {
                $(this).addClass('off');
                threedee = false;
            } else {
                $(this).removeClass('off');
                threedee = true;
            }            
        } else {
            alert("Sorry, WebGL is required for anaglyphic 3D! Try a recent Chrome or Firefox version.");
        }
    })


});