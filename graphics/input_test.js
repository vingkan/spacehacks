"use strict"

var QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  } 
  return query_string;
}();

//var ROOM_KEY = window.opener.ROOM_KEY || false;
var ROOM_KEY = QueryString.gid || false;

// var THREE = require('three');
// var StereoEffect = require('three-stereo-effect')(THREE);
// register the application module
b4w.register("stereo_view", function(exports, require) {


// import modules used by the app
var m_anim      = require("animation");
var m_app       = require("app");
var m_data      = require("data");
var m_cfg       = require("config");
var m_version   = require("version");
var m_textures  = require("textures");
var m_scenes    = require("scenes");
var m_material  = require("material");
var m_cont      = require("container");
var m_gyro      = require("gyroscope");

var m_util      = require("util");
var m_lights    = require("lights");
var m_geometry  = require("geometry");
var m_transform = require("transform");

// variables
var TIME_DELAY = 1000 / 24;
var WAITING_DELAY = 1000;
var DEBUG = (m_version.type() === "DEBUG");
var _previous_selected_obj = null;

MissionLink.sync(window.ROOM_KEY);

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
        autoresize: true,
        stereo: "HMD"
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

        m_anim.apply_def(obj);
        m_anim.play(obj);
        // m_anim.play(obj, function(data) {
        //  m_anim.stop(data);
        // });
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

    init_screen();

    var stereoCanvas = m_textures.get_canvas_ctx(m_scenes.get_object_by_name("TV_R"), "Texture.001");

}

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

var init_screen = function() {
    // var error_cap = m_scenes.get_object_by_name("Text");
    // m_scenes.hide_object(error_cap);

    var circuitWindow = document.getElementById('circuits');
    getIframeWindow(circuitWindow).init(MissionLink.getRoomKey());

    var obj = m_scenes.get_object_by_name("TV_R");
    var context = m_textures.get_canvas_ctx(obj, "Texture.001");
    var update_canvas = function() {
        db.ref(MissionLink.getRoomKey() + '/modules/circuits/data-uri').once('value', function(snap){
            var dataURI = snap.val();
            if(dataURI){
                var imgObj = new Image();
                imgObj.crossOrigin = 'anonymous';
                imgObj.src = dataURI;
                imgObj.onload = function(){
                    context.drawImage(imgObj, 0, 0, context.canvas.width, context.canvas.height);
                }
            }
        });
        m_textures.update_canvas_ctx(obj, "Texture.001");
        setTimeout(function() {update_canvas()}, TIME_DELAY);
    }

    update_canvas();
}

});

window.initGame = function(roomKey){
    window.ROOM_KEY = roomKey;
    // import the app module and start the app by calling the init method
    b4w.require("stereo_view").init();
}

initGame(window.ROOM_KEY);