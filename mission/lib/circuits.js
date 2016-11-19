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
	ctx.fillText(text, i[0] - (s.size / 4), i[1] + (s.size / 4));
	ctx.closePath();
}

function renderCircuit(c){

	drawRect({
		x: 0,
		y: 0,
		width: canvas.width,
		height: canvas.height,
	}, '#20221fff');

	drawCircle({
		x: 100,
		y: 100,
		r: 20
	}, 'green');

	drawText("A", [100, 100], {
		size: 20
	});

	drawLine([0, 0], [100, 100], 'red');


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

renderCircuit(c);
