"use strict"

// register the application module
b4w.register("input_test", function(exports, require) {


// import modules used by the app
var m_anim      = require("animation");
var m_app       = require("app");
var m_data      = require("data");
var m_scenes    = require("scenes");
var m_material  = require("material");
var m_util 		= require("util");
var m_lights 	= require("lights");

var m_geometry  = require("geometry");
var m_transform = require("transform");

var _previous_selected_obj = null;

/**
 * export the method to initialize the app (called at the bottom of this file)
 */
exports.init = function() {
    m_app.init({
        canvas_container_id: "main_canvas_container",
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
        // 	m_anim.stop(data);
        // });
        console.log(obj);
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

    // place your code here
    m_anim.play(m_scenes.get_object_by_name("Icosphere0"));
    m_anim.play(m_scenes.get_object_by_name("Icosphere2"));
    m_anim.play(m_scenes.get_object_by_name("Icosphere4"));
}


});

// import the app module and start the app by calling the init method
b4w.require("input_test").init();

