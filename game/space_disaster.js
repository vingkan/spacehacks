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

// register the application module
b4w.register("space_disaster", function(exports, require) {

// import modules used by the app
var m_app       = require("app");
var m_anim      = require("animation");
var m_armat     = require("armature");
var m_cam       = require("camera");
var m_cfg       = require("config");
var m_cont      = require("container");
var m_ctl       = require("controls");
var m_data      = require("data");
var m_gp_conf   = require("gp_conf");
var m_hmd       = require("hmd");
var m_hmd_conf  = require("hmd_conf");
var m_input     = require("input");
var m_mouse     = require("mouse");
var m_quat      = require("quat");
var m_obj       = require("objects");
var m_preloader = require("preloader");;
var m_print     = require("print");
var m_phy       = require("physics");
var m_scs       = require("scenes");
var m_sfx       = require("sfx");
var m_tex       = require("textures");
var m_trans     = require("transform");
var m_tsr       = require("tsr");
var m_vec3      = require("vec3");
var m_ver       = require("version");
var m_util      = require("util");
var m_mat       = require("material");

var _quat_tmp = m_quat.create();
var _quat_tmp2 = m_quat.create();
var _vec2_tmp = new Float32Array(2);
var _vec3_tmp = m_vec3.create();
var _vec3_tmp2 = m_vec3.create();
var _tsr_tmp = m_tsr.create();

var QUAT4_IDENT = new Float32Array([0,0,0,1]);

var GAMEPAD_AXIS_ROTATION = 0.2;

var USERMEDIA_TIME_DELAY = 1000 / 24;

// objects
var _cockpit = null;
var _asteroid_list = [];

var _velocity_tmp = {};

var _dest_x_trans = 0;
var _dest_z_trans = 0;

// detect application mode
var TIME_DELAY = 1000 / 24;
var WAITING_DELAY = 1000;
var DEBUG = (m_ver.type() === "DEBUG");
var _previous_selected_obj = null;

// automatically detect assets path
//var APP_ASSETS_PATH = m_cfg.get_std_assets_path() + "space_disaster/";
var APP_ASSETS_PATH = m_cfg.get_std_assets_path() + "spacehacks/";
console.log(APP_ASSETS_PATH);
//http://localhost:8000/src/../deploy/assets/space_disaster/

window.m_scs = m_scs;

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
    var show_fps = DEBUG;

    var url_params = m_app.get_url_params();

    if (url_params && "show_fps" in url_params)
        show_fps = true;
    m_app.init({
        canvas_container_id: "main_canvas_container",
        callback: init_cb,
        console_verbose: true,
        show_fps: show_fps,
        assets_dds_available: !DEBUG,
        assets_pvr_available: !DEBUG,
        assets_min50_available: !DEBUG,
        // NOTE: autoresize doesn't work with VR-mode in GearVR, bcz there is
        // a GearVR problem!!!
        autoresize: true,

        // change scene graph
        stereo: "HMD"
    });
}

/**
 * callback executed when the app is initialized
 */
function init_cb(canvas_elem, success) {

    if (!success) {
        console.log("b4w init failure");
        return;
    }

    // canvas_elem.addEventListener("mousedown", function(e) 
    // {
    //     console.log(e);
    //     if (e.preventDefault)
    //         e.preventDefault();

    //     var x = e.clientX;
    //     var y = e.clientY;

    //     console.log(x + ", " + y);

    //     var obj = m_scs.pick_object(x, y);

    //     console.log(obj);

    // }, false);

    m_preloader.create_preloader();

    load();
}

function preloader_cb(percentage) {
    m_preloader.update_preloader(percentage);
}

/**
 * load the scene data
 */
function load() {
    //m_data.load(APP_ASSETS_PATH + "space_disaster.json", load_cb, preloader_cb);
    m_data.load(APP_ASSETS_PATH + "Engine.json", load_cb, preloader_cb);
    console.log("test-1:" + m_scs.can_select_objects());
    // if (!m_scs.can_select_objects()) {
    //     m_scs.can_select_objects() = function() {return true;}
    // }
    // console.log("test-12:" + m_scs.can_select_objects());
}

/**
 * callback executed when the scene is loaded
 */
function load_cb(data_id) {
    // m_app.enable_camera_controls();
    //==========================================================================
    // First way to split screen: m_scenes.set_hmd_params
    // For example
    // m_scs.set_hmd_params(
    //         {enable_hmd_stereo: true,
    //         distortion_coefs : [0.22, 0.28],
    //         chromatic_aberration_coefs : [-0.015, 0.02, 0.025, 0.02]})
    // var canvas_container_elem = m_cont.get_container();
    // var ccw = canvas_container_elem.clientWidth;
    // var cch = canvas_container_elem.clientHeight;
    // m_cont.resize(ccw, cch, true);

    //==========================================================================
    // Second way to split screen: use devices
    // var camobj = m_scs.get_active_camera();
    // if (m_input.can_use_device(m_input.DEVICE_HMD))
    //     m_input.enable_split_screen(camobj);
    // else
    //     console.log("HMD device does not avaliable.");

    //==========================================================================

    //m_app.enable_controls();
    m_app.enable_camera_controls();

    //m_gyro.enable_camera_rotation();

    init_screen();

    var stereoCanvas = m_tex.get_canvas_ctx(m_scs.get_object_by_name("TV_R"), "Texture.001");


    // Third way to split screen: m_hmd.enable_hmd
    console.log("test0:" + m_scs.can_select_objects());
    if (m_hmd.check_browser_support())
        register_hmd();

    register_mouse(m_hmd.check_browser_support());

    register_keyboard();
    register_gamepad(m_hmd.check_browser_support());

    //==========================================================================


}

var init_screen = function() {
    // var error_cap = m_scenes.get_object_by_name("Text");
    // m_scenes.hide_object(error_cap);

    var circuitWindow = document.getElementById('circuits');
    getIframeWindow(circuitWindow).init(MissionLink.getRoomKey());

    var obj = m_scs.get_object_by_name("TV_R");
    var context = m_tex.get_canvas_ctx(obj, "Texture.001");
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
        m_tex.update_canvas_ctx(obj, "Texture.001");
        setTimeout(function() {update_canvas()}, TIME_DELAY);
    }

    update_canvas();
}

function register_gamepad(is_hmd) {
    m_gp_conf.update();
    // PS4 controller
    var controller_cb = function(obj, id, pulse) {
        var w = m_ctl.get_sensor_value(obj, id, 0);
        var d = m_ctl.get_sensor_value(obj, id, 1);
        var s = m_ctl.get_sensor_value(obj, id, 2);
        var a = m_ctl.get_sensor_value(obj, id, 3);
        var r1 = m_ctl.get_sensor_value(obj, id, 4);
        var r2 = m_ctl.get_sensor_value(obj, id, 5);
        var l1 = m_ctl.get_sensor_value(obj, id, 6);
        var l2 = m_ctl.get_sensor_value(obj, id, 7);
        var left_vaxis = m_ctl.get_sensor_value(obj, id, 8);
        var left_haxis = m_ctl.get_sensor_value(obj, id, 9);
        var right_vaxis = m_ctl.get_sensor_value(obj, id, 10);
        var right_haxis = m_ctl.get_sensor_value(obj, id, 11);
        var elapsed = m_ctl.get_sensor_value(obj, id, 12);
        var time = m_ctl.get_sensor_value(obj, id, 13);

        var rot_value = elapsed * GAMEPAD_AXIS_ROTATION;

        if (r1 || r2 || l1 || l2)
            canvas_click(time);

        if (!is_hmd) {
            var cam_angles = m_cam.get_camera_angles(obj, _vec2_tmp);
            var vert_ang = cam_angles[1] - right_haxis * rot_value;
            var hor_ang = - right_vaxis * rot_value;

            m_cam.eye_rotate(obj, hor_ang, vert_ang, false, true);
        }
    }

    var init_sensors = function(index) {
        var gs_w = m_ctl.create_gamepad_btn_sensor(m_input.GMPD_BUTTON_12, index);
        var gs_d = m_ctl.create_gamepad_btn_sensor(m_input.GMPD_BUTTON_15, index);
        var gs_s = m_ctl.create_gamepad_btn_sensor(m_input.GMPD_BUTTON_13, index);
        var gs_a = m_ctl.create_gamepad_btn_sensor(m_input.GMPD_BUTTON_14, index);

        var gs_r1 = m_ctl.create_gamepad_btn_sensor(m_input.GMPD_BUTTON_4, index);
        var gs_r2 = m_ctl.create_gamepad_btn_sensor(m_input.GMPD_BUTTON_5, index);
        var gs_l1 = m_ctl.create_gamepad_btn_sensor(m_input.GMPD_BUTTON_6, index);
        var gs_l2 = m_ctl.create_gamepad_btn_sensor(m_input.GMPD_BUTTON_7, index);

        var left_vert_axis = m_ctl.create_gamepad_axis_sensor(m_input.GMPD_AXIS_0, index);
        var left_hor_axis = m_ctl.create_gamepad_axis_sensor(m_input.GMPD_AXIS_1, index);
        var right_vert_axis = m_ctl.create_gamepad_axis_sensor(m_input.GMPD_AXIS_2, index);
        var right_hor_axis = m_ctl.create_gamepad_axis_sensor(m_input.GMPD_AXIS_3, index);
        var e_s = m_ctl.create_elapsed_sensor();
        var time = m_ctl.create_timeline_sensor();

        var cam_obj = m_scs.get_active_camera();
        m_ctl.create_sensor_manifold(cam_obj, "CONTROLLER_CAMERA_MOVE" + index,
                m_ctl.CT_CONTINUOUS, [gs_w, gs_d, gs_s, gs_a, gs_r1, gs_r2,
                gs_l1, gs_l2, left_vert_axis, left_hor_axis, right_vert_axis,
                right_hor_axis, e_s, time],
                function() {return true}, controller_cb);
    };

    for (var i = 0; i < 4; i++)
        init_sensors(i);
}

function register_mouse(is_hmd) {
    console.log("register_mouse function");
    console.log("test1:" + m_scs.can_select_objects());
    if (!is_hmd) {
        console.log("test2:" + m_scs.can_select_objects());
        // use pointerlock
        /*var canvas_elem = m_cont.get_canvas();
        canvas_elem.addEventListener("mousedown", function(e) {
            m_mouse.request_pointerlock(canvas_elem);
        }, false);*/
        var canvas_elem = document.getElementById('main_canvas_container');
        document.addEventListener('click', function(e){
            main_canvas_click(e);
            /*var obj = m_scs.pick_object(canvas_elem.width/2, canvas_elem.height/2);
            console.log(obj);*/
        });
    } 
    else {
        // TODO: add menu and use mouse sensors
        console.log("test3:" + m_scs.can_select_objects());
        var is_clicked = false;

        var container = m_cont.get_container();
        container.addEventListener("click", function(e) {
            // go to VR-mode in case of using HMD (WebVR API 1.0)
            m_input.request_fullscreen_hmd();
            // canvas_click
            is_clicked = true;
        });

        console.log("test4:" + m_scs.can_select_objects());
        var canvas_elem = document.getElementById('main_canvas_container');
        console.log("Getting: " + canvas_elem.height + " height, " +canvas_elem.width +" width");

        document.addEventListener('click', function(e){
            console.log('CLICKED FRIENDS');
            var obj = m_scs.pick_object(canvas_elem.width/2, canvas_elem.height/2);
            console.log(obj);
        });

    }



    // var shoot_cb = function(obj, id, pulse) {
    //     if (is_clicked) {
    //         // need to get the center of the viewport
    //         var canvas_elem = document.getElementById('main_canvas_container');
    //         console.log("Getting: " + canvas_elem.height + " height, " +canvas_elem.width +" width");
    //         var obj = m_scs.pick_object(canvas_elem.width/2, canvas_elem.height/2);
    //         console.log(obj);
    //         //console.log(obj + ", " + id);
    //         //var time = m_ctl.get_sensor_value(obj, id, 0);
    //         //canvas_click(time);
    //         is_clicked = false;
    //     }
    // }

    //var time = m_ctl.create_timeline_sensor();
    // TODO: rewrite using MOUSE_CLICK sensors
    // right now there is GearVR touch sensor problems
    // var mclick = m_ctl.create_mouse_click_sensor();
    //m_ctl.create_sensor_manifold(null, "MOUSE_SHOOT", m_ctl.CT_POSITIVE, [time], null, shoot_cb);
}

function register_keyboard() {
    var key_w = m_ctl.create_keyboard_sensor(m_ctl.KEY_W);
    var key_s = m_ctl.create_keyboard_sensor(m_ctl.KEY_S);
    var key_a = m_ctl.create_keyboard_sensor(m_ctl.KEY_A);
    var key_d = m_ctl.create_keyboard_sensor(m_ctl.KEY_D);

    var key_cb = function(obj, id, pulse, param) {
        if (pulse == 1) {
            var elapsed = m_ctl.get_sensor_value(obj, id, 0);

            var velocity = m_cam.get_velocities(obj, _velocity_tmp);
            switch (id) {
            case "LEFT":
                _dest_x_trans -= velocity.trans * COCKPIT_TRANS_FACTOR * elapsed;
                break;
            case "RIGHT":
                _dest_x_trans += velocity.trans * COCKPIT_TRANS_FACTOR * elapsed;
                break;
            case "UP":
                _dest_z_trans += velocity.trans * COCKPIT_TRANS_FACTOR * elapsed;
                break;
            case "DOWN":
                _dest_z_trans -= velocity.trans * COCKPIT_TRANS_FACTOR * elapsed;
                break;
            }
        }
    }

    var elapsed = m_ctl.create_elapsed_sensor();
    var cam_obj = m_scs.get_active_camera();
    m_ctl.create_sensor_manifold(cam_obj, "LEFT", m_ctl.CT_CONTINUOUS,
            [elapsed, key_a], null, key_cb);
    m_ctl.create_sensor_manifold(cam_obj, "RIGHT", m_ctl.CT_CONTINUOUS,
            [elapsed, key_d], null, key_cb);
    m_ctl.create_sensor_manifold(cam_obj, "UP", m_ctl.CT_CONTINUOUS,
            [elapsed, key_w], null, key_cb);
    m_ctl.create_sensor_manifold(cam_obj, "DOWN", m_ctl.CT_CONTINUOUS,
            [elapsed, key_s], null, key_cb);
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

    var cam_obj = m_scs.get_active_camera();
    m_ctl.create_sensor_manifold(cam_obj, "HMD_TRANSLATE_CAMERA",
            m_ctl.CT_CONTINUOUS, [elapsed, psensor], null, hmd_cb);
}

function canvas_click(e) {

    console.log(e);


    if (e.preventDefault)
        e.preventDefault();

    var x = e.clientX;
    var y = e.clientY;

    console.log(x + ", " + y);

    var obj = m_scs.pick_object(x, y);

    if (obj) {
        if (_previous_selected_obj) {
            m_anim.stop(_previous_selected_obj);
            m_anim.set_frame(_previous_selected_obj, 0);
        }
        _previous_selected_obj = obj;

        if (obj.name == "fullscreen") {
            toggleFullScreen();
            console.log("fullscreen");
        }
        else {
            m_anim.apply_def(obj);
            m_anim.play(obj);
            console.log(obj);
            //MissionLink._pushButton(BUTTON_MAPPING[obj.name]);
        }
        
    }
    
    console.log("screen clicked");

}

var BUTTON_MAPPING = {
    'Circle': 'alpha',
    'Square': 'beta',
    'Triangle': 'gamma',
    'Diamond': 'delta'
}

function main_canvas_click(e) {
    //console.log("main canvas" + e);
    if (e.preventDefault)
        e.preventDefault();

    var x = e.clientX;
    var y = e.clientY;

    var obj = m_scs.pick_object(x, y);

    if (obj) {
        if (_previous_selected_obj) {
            m_anim.stop(_previous_selected_obj);
            m_anim.set_frame(_previous_selected_obj, 0);
        }
        _previous_selected_obj = obj;

        if (obj.name == "fullscreen")
            toggleFullScreen();
        else {
            m_anim.apply_def(obj);
            m_anim.play(obj);

            console.log(obj);
            MissionLink._pushButton(BUTTON_MAPPING[obj.name]);
        }

    }
}

});

window.initGame = function(roomKey){
    window.ROOM_KEY = roomKey;
    // import the app module and start the app by calling the init method
    b4w.require("space_disaster").init();
}

initGame(window.ROOM_KEY);