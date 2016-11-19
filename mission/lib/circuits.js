var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

function clearCanvas(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawRect(r, fill){
	ctx.beginPath();
	ctx.rect(r.x, r.y, r.width, r.height);
	ctx.stroke();
	if(fill){
		ctx.fillStyle = fill;
		ctx.fill();
	}
	ctx.closePath();
}

function drawCircle(c, fill){
	ctx.beginPath();
	ctx.arc(c.x, c.y, c.r, 0, 2 * Math.PI, false);
	if(fill){
		ctx.fillStyle = fill;
		ctx.fill();
	}
	ctx.closePath();
}

function drawLine(i, f, stroke){
	ctx.beginPath();
	ctx.moveTo(i[0], i[1]);
	ctx.lineTo(f[0], f[1]);
	if(stroke){
		ctx.strokeStyle = stroke;
	}
	ctx.lineWidth = 2;
	ctx.stroke();
	ctx.closePath();
}

function drawText(text, i, opt){
	var s = {
		size: opt.size || 20,
		font: opt.font || 'Consolas',
		fill: opt.fill || 'white'
	}
	ctx.beginPath();
	ctx.font = s.size + 'px ' + s.font;
	if(s.fill){
		ctx.fillStyle = s.fill;
	}
	ctx.fillText(text, i[0] - (s.size * 0.25), i[1] + (s.size * 0.30));
	ctx.closePath();
}

var NODE_POS = [
	{x: 60, y: 50, node: false},
	{x: 60, y: 150, node: false},
	{x: 60, y: 250, node: false},
	{x: 60, y: 350, node: false},
	{x: 180, y: 50, node: false},
	{x: 180, y: 150, node: false},
	{x: 180, y: 250, node: false},
	{x: 180, y: 350, node: false}
];

var BASE_COLOR = '#20221f';
var CIRCUIT_GREEN = '#0cdc56';
var LED_COLOR = {
	red: '#eb5c1f',
	blue: '#0bebe5',
	green: '#0cdc56',
	yellow: '#d3eb37'
}

function renderCircuit(c){

	drawRect({
		x: 0,
		y: 0,
		width: canvas.width,
		height: canvas.height,
	}, BASE_COLOR);

	drawRect({
		x: 98,
		y: 78,
		width: 44,
		height: 44,
	}, LED_COLOR[c.led]);

	drawRect({
		x: 100,
		y: 80,
		width: 40,
		height: 40,
	}, BASE_COLOR);

	drawRect({
		x: 110,
		y: 90,
		width: 20,
		height: 20,
	}, LED_COLOR[c.led]);

	/*drawLine([0, 50], [240, 50], 'gray');
	drawLine([0, 150], [240, 150], 'gray');
	drawLine([0, 250], [240, 250], 'gray');
	drawLine([0, 350], [240, 350], 'gray');

	drawLine([60, 0], [60, 400], 'gray');
	drawLine([180, 0], [180, 400], 'gray');*/

	for(var n in c.nodes){
		var node = c.nodes[n];
		if(node){
			var pos = {node: true};
			while(pos.node){
				var idx = Math.floor((NODE_POS.length * Math.random()));
				pos = NODE_POS[idx];
			}
			c.nodes[n] = {exists: true, pos: pos};
			pos.node = n;
		}
	}

	for(var w = 0; w < c.wires.length; w++){
		var path = c.wires[w];
		var i = c.nodes[path.node1].pos;
		var f = c.nodes[path.node2].pos;
		var brk = {
			x: 0,
			y: 0
		}
		if(i.x === f.x || i.y == f.y){
			drawLine([i.x, i.y], [f.x, f.y], 'white');
			if(i.x === f.x){
				brk.x = i.x;
				brk.y = (f.y - i.y) / 2;
			}
			else{
				brk.x = (f.x - i.x) / 2;
				brk.y = i.y;
			}
		}
		else{
			drawLine([i.x, i.y], [i.x, f.y], 'white');
			drawLine([i.x, f.y], [f.x, f.y], 'white');
			brk.x = i.x;
			brk.y = f.y;
		}
		if(path.broken){
			drawCircle({
				x: brk.x,
				y: brk.y,
				r: 10
			}, BASE_COLOR);
		}
	}

	for(var n in c.nodes){
		var node = c.nodes[n];
		if(node){
			var pos = node.pos;
			drawCircle({
				x: pos.x,
				y: pos.y,
				r: 20
			}, CIRCUIT_GREEN);
			drawText(n.toUpperCase(), [pos.x, pos.y], {
				size: 20,
				fill: 'white'
			});
		}
	}

}

var circuit = {
	nodes: {
		a: true,
		b: true,
		c: true,
		d: false,
		e: false
	},
	led: 'red',
	wires: [
		{node1: 'a', node2: 'c', broken: false},
		{node1: 'c', node2: 'b', broken: true}
	]
}

renderCircuit(circuit);
