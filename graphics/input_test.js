"use strict"

// register the application module
b4w.register("input_test", function(exports, require) {

console.log('difference')

// import modules used by the app
var m_anim      = require("animation");
var m_app       = require("app");
var m_data      = require("data");
var m_cfg 		= require("config");
var m_version	= require("version");
var m_textures  = require("textures");
var m_scenes    = require("scenes");
var m_material  = require("material");
var m_cont 		= require("container");
var m_gyro      = require("gyroscope");

var m_util 		= require("util");
var m_lights 	= require("lights");
var m_geometry  = require("geometry");
var m_transform = require("transform");

// variables
var TIME_DELAY = 1000 / 24;
var WAITING_DELAY = 1000;
var DEBUG = (m_version.type() === "DEBUG");
var _previous_selected_obj = null;
var _cam_waiting_handle = null;

MissionLink.sync();

/**
 * Support sketchy iFrame operations by donating to W3 today!
 */
function getIframeWindow(iframe_object) {
  var doc;

  if (iframe_object.contentWindow) {
    return iframe_object.contentWindow;
  }

  if (iframe_object.window) {
    return iframe_object.window;
  } 

  if (!doc && iframe_object.contentDocument) {
    doc = iframe_object.contentDocument;
  } 

  if (!doc && iframe_object.document) {
    doc = iframe_object.document;
  }

  if (doc && doc.defaultView) {
   return doc.defaultView;
  }

  if (doc && doc.parentWindow) {
    return doc.parentWindow;
  }

  return undefined;
}

/*var el = document.getElementById('targetFrame');
getIframeWindow(el).putme();*/

/**
 * export the method to initialize the app (called at the bottom of this file)
 */
exports.init = function() {
    m_app.init({
        canvas_container_id: "main_canvas_container", // name of id for the canvas in index.html
        callback: init_cb,
        show_fps: true,
        console_verbose: true,
        autoresize: true
    });
}

/**
 * callback executed when the app is initizalized 
 */
function init_cb(canvas_elem, success) {

    if (!success) {
        console.log("b4w init failure");
        return;
    }

    canvas_elem.addEventListener("mousedown", main_canvas_click, false);

    load();
}

var BUTTON_MAPPING = {
    'Circle': 'alpha',
    'Square': 'beta',
    'Triangle': 'gamma',
    'Diamond': 'delta'
}

function main_canvas_click(e) {
    if (e.preventDefault)
        e.preventDefault();

    var x = e.clientX;
    var y = e.clientY;

    var obj = m_scenes.pick_object(x, y);

    if (obj) {
        if (_previous_selected_obj) {
            m_anim.stop(_previous_selected_obj);
            m_anim.set_frame(_previous_selected_obj, 0);
        }
        _previous_selected_obj = obj;

        if (obj.name == "fullscreen")
            toggleFullScreen();

        m_anim.apply_def(obj);
        m_anim.play(obj);

        console.log(obj);
        MissionLink._pushButton(BUTTON_MAPPING[obj.name]);
    }
}

/**
 * load the scene data
 */
function load() {
	// name of the json file exported from blender
    m_data.load("Engine.json", load_cb);
}

/**
 * callback executed when the scene is loaded
 */
function load_cb(data_id) {
    m_app.enable_controls();
    m_app.enable_camera_controls();

    m_gyro.enable_camera_rotation();

    if (Boolean(get_user_media()))
        start_video();

    // prints out the canvas
    var stereoCanvas = m_textures.get_canvas_ctx(m_scenes.get_object_by_name("TV_R"), "Texture.001");
    console.log(stereoCanvas.canvas);
}

function get_user_media() {
    if (Boolean(navigator.getUserMedia))
        return navigator.getUserMedia.bind(navigator);
    else if (Boolean(navigator.webkitGetUserMedia))
        return navigator.webkitGetUserMedia.bind(navigator);
    else if (Boolean(navigator.mozGetUserMedia))
        return navigator.mozGetUserMedia.bind(navigator);
    else if (Boolean(navigator.msGetUserMedia))
        return navigator.msGetUserMedia.bind(navigator);
    else
        return null;
}

function start_video() {

    if (_cam_waiting_handle)
        clearTimeout(_cam_waiting_handle);

    var user_media = get_user_media();
    var media_stream_constraint = {
        video: { width: 1280, height: 720 }
    };
    var success_cb = function(local_media_stream) {
        var video = document.createElement("video");
        video.setAttribute("autoplay", "true");
        video.src = window.URL.createObjectURL(local_media_stream);
        // var error_cap = m_scenes.get_object_by_name("Text");
        // m_scenes.hide_object(error_cap);

        var obj = m_scenes.get_object_by_name("TV_R"); // name of the object 
        var context = m_textures.get_canvas_ctx(obj, "Texture.001");
        var update_canvas = function() {
        	//context.change_image(obj, "Texture.001", "blendFiles/_texture/screen.png");
        	//context.play_video(video);

        db.ref('modules/circuits/data-uri').on('value', function(snap){

        });
        var dataURI = 'data:image/gif;base64,R0lGODdhMAAwAPAAAAAAAP///ywAAAAAMAAw AAAC8IyPqcvt3wCcDkiLc7C0qwyGHhSWpjQu5yqmCYsapyuvUUlvONmOZtfzgFz ByTB10QgxOR0TqBQejhRNzOfkVJ+5YiUqrXF5Y5lKh/DeuNcP5yLWGsEbtLiOSp a/TPg7JpJHxyendzWTBfX0cxOnKPjgBzi4diinWGdkF8kjdfnycQZXZeYGejmJl ZeGl9i2icVqaNVailT6F5iJ90m6mvuTS4OK05M0vDk0Q4XUtwvKOzrcd3iq9uis F81M1OIcR7lEewwcLp7tuNNkM3uNna3F2JQFo97Vriy/Xl4/f1cf5VWzXyym7PH hhx4dbgYKAAA7';

        var imgObj = new Image();
        imgObj.crossOrigin = 'anonymous';
        imgObj.src = dataURI;
        imgObj.onload = function(){
            //ctx.drawImage(this, 0, 0);
            //ctx.drawImage(imgObj, 0, 0, 200, 200, 0, 0, ctx.canvas.width, ctx.canvas.height);
            context.drawImage(imgObj, 0, 0, context.canvas.width, context.canvas.height);
            console.log(context.canvas.width, context.canvas.height)
        }
        

            //context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, context.canvas.width, context.canvas.height);
            m_textures.update_canvas_ctx(obj, "Texture.001");
            setTimeout(function() {update_canvas()}, TIME_DELAY);
        }

        video.onloadedmetadata = function(e) {
            update_canvas();
        };
    };

    function toggleFullScreen() {
  		var doc = window.document;
  		var docEl = doc.documentElement;
	
  		var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  		var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

  		if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    		requestFullScreen.call(docEl);
  		}
  		else {
    		cancelFullScreen.call(doc);
  		}
	}

    var fail_cb = function() {
        //var error_cap = m_scenes.get_object_by_name("Text");
        _cam_waiting_handle = setTimeout(start_video, WAITING_DELAY);
    };

    user_media(media_stream_constraint, success_cb, fail_cb);
}

});

// import the app module and start the app by calling the init method
b4w.require("input_test").init();

