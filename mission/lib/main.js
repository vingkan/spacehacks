var XYZ = function(x, y, z){
	return {
		x: x,
		y: y,
		z: z
	}
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
}

var x = [0, 1];
var y = [0, 1];
var z = [0, 1];
var c = 'red';

Plotly.plot('graph', [{
	type: 'scatter3d',
	mode: 'lines',
	x: x,
	y: y,
	z: z,
	opacity: 1,
	line: {
		width: 6,
		color: c,
		reversescale: false
	}
}], {
	height: 640,
	scene: {
		aspectratio: XYZ(1, 1, 1),
		camera: {
			center: XYZ(0, 0, 0),
			eye: XYZ(1.25, 1.25, 1.25),
			up: XYZ(0, 0, 1)
		}
	},
	xaxis: {
		zeroline: false,
		color: 'red'
	}
});
=======
}
>>>>>>> master
=======
}
>>>>>>> master
=======
}
>>>>>>> master
=======
}
>>>>>>> master
