"use strict"

var ROOM_KEY = false;

// var THREE = require('three');
// var StereoEffect = require('three-stereo-effect')(THREE);
// register the application module
b4w.register("stereo_view", function(exports, require) {


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
var m_preloader = require("preloader");
var m_hmd       = require("hmd");
var m_hmd_conf  = require("hmd_conf");
var m_ctl       = require("controls");
var m_vec3      = require("vec3");
var m_quat      = require("quat");
var m_tsr       = require("tsr");
var m_input     = require("input");

var m_util 		= require("util");
var m_lights 	= require("lights");
var m_geometry  = require("geometry");
var m_transform = require("transform");

var _quat_tmp = m_quat.create();
var _quat_tmp2 = m_quat.create();
var _vec2_tmp = new Float32Array(2);
var _vec3_tmp = m_vec3.create();
var _vec3_tmp2 = m_vec3.create();
var _tsr_tmp = m_tsr.create();

// variables
var TIME_DELAY = 1000 / 24;
var WAITING_DELAY = 1000;
var DEBUG = (m_version.type() === "DEBUG");
var _previous_selected_obj = null;
var _cam_waiting_handle = null;

var _dest_x_trans = 0;
var _dest_z_trans = 0;

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

    m_preloader.create_preloader();

    canvas_elem.addEventListener("mousedown", main_canvas_click, false);

    load();
}

function preloader_cb(percentage) {
    m_preloader.update_preloader(percentage);
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

        if (obj.name == "fullscreen") {
            toggleFullScreen();
            console.log("fullscreen toggle");
        }
        else {
            m_anim.apply_def(obj);
            m_anim.play(obj);
            console.log(obj);
            MissionLink._pushButton(BUTTON_MAPPING[obj.name]);
        }
    }
}

/**
 * load the scene data
 */
function load() {
	// name of the json file exported from blender
    m_data.load("Engine.json", load_cb, preloader_cb);
}

/**
 * callback executed when the scene is loaded
 */
function load_cb(data_id) {
    m_app.enable_controls();
    m_app.enable_camera_controls();

    m_gyro.enable_camera_rotation();

    init_screen();

    console.log(m_hmd.check_browser_support());
    if (m_hmd.check_browser_support())
        register_hmd();
    register_mouse(m_hmd.check_browser_support());

    var stereoCanvas = m_textures.get_canvas_ctx(m_scenes.get_object_by_name("TV_R"), "Texture.001");
    console.log(stereoCanvas);

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

function register_mouse(is_hmd) {
    if (!is_hmd) {
        // use pointerlock
        var canvas_elem = m_cont.get_canvas();
        canvas_elem.addEventListener("mouseup", function(e) {
            m_mouse.request_pointerlock(canvas_elem);
        }, false);
    }
    console.log("register_mouse test");
    m_input.request_fullscreen_hmd();
    // TODO: add menu and use mouse sensors
    var is_clicked = false;

    var container = m_cont.get_container();
    container.addEventListener("click", function(e) {
        // go to VR-mode in case of using HMD (WebVR API 1.0)
        m_input.request_fullscreen_hmd();
        // shoot
        is_clicked = true;
    })

    // var shoot_cb = function(obj, id, pulse) {
    //     if (is_clicked) {
    //         var time = m_ctl.get_sensor_value(obj, id, 0);
    //         shoot(time);
    //         is_clicked = false;
    //     }
    // }

    // var time = m_ctl.create_timeline_sensor();
    // TODO: rewrite using MOUSE_CLICK sensors
    // right now there is GearVR touch sensor problems
    var mclick = m_ctl.create_mouse_click_sensor();
    // m_ctl.create_sensor_manifold(null, "MOUSE_SHOOT",
    //         m_ctl.CT_POSITIVE, [time], null, shoot_cb);
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

//==============================================================================
// SETUP HMD LOGIC
//==============================================================================
function register_hmd() {
    m_hmd_conf.update();
    // camera rotation is enabled with HMD
    m_hmd.enable_hmd(m_hmd.HMD_ALL_AXES_MOUSE_NONE);

    var elapsed = m_ctl.create_elapsed_sensor();
    var psensor = m_ctl.create_hmd_position_sensor();
    var updated_eye_data = false;

    var last_hmd_pos = m_vec3.create();
    var dest_hmd_pos = m_vec3.create();
    var hmd_cb = function(obj, id, pulse) {
        if (pulse > 0) {
            var hmd_pos = m_ctl.get_sensor_payload(obj, id, 1);

            var device = m_input.get_device_by_type_element(m_input.DEVICE_HMD);
            if (!updated_eye_data) {
                m_vec3.copy(hmd_pos, last_hmd_pos);
                updated_eye_data = true;
            } else {
                var diff_hmd_pos = m_vec3.subtract(hmd_pos, last_hmd_pos, _vec3_tmp2);
                m_vec3.scale(diff_hmd_pos, 15, diff_hmd_pos);
                _dest_x_trans += diff_hmd_pos[0];
                _dest_z_trans += diff_hmd_pos[2];
                m_vec3.copy(hmd_pos, last_hmd_pos);
            }
        }
    }

    var cam_obj = m_scenes.get_active_camera();
    m_ctl.create_sensor_manifold(cam_obj, "HMD_TRANSLATE_CAMERA",
            m_ctl.CT_CONTINUOUS, [elapsed, psensor], null, hmd_cb);
}

});

var promise = db.ref('games').push({timestamp: Date.now()});
promise.then(function(data){
    window.ROOM_KEY = promise.path['o'][1];
    // import the app module and start the app by calling the init method
    b4w.require("stereo_view").init();
});