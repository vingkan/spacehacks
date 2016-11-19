function convertToCantor(rho, theta, phi) {
    var a = toCantor(rho, theta);
    var b = toCantor(theta, phi);
    var c = toCantor(phi, rho);
    return {a: a, b: b, c: c};
}

// Converts formula output given by engineer to a 3D vector
function convertToVector(a, b, c) {
    var rho = invertCantor(a)['x'];
    var theta = invertCantor(b)['x'];
    var phi = invertCantor(c)['x'];
    return {rho: rho, theta: theta, phi: phi};
}

function toCantor(x, y) {
    return ((x+y) * (x+y+1)) / 2 + y;
}

// Inverts the Cantor pairing function
function invertCantor(z) {
    var w = Math.floor((Math.sqrt(8*z+1)-1) / 2);
    var t = (Math.pow(w, 2) + w) / 2;
    var y = z - t;
    var x = w - y;
    return {x: x, y: y};
}

// var vector = {
//     rho: 30,
//     theta: 2,
//     phi: 30
// };
// console.log('Vector: ', vector);
// var cantor = convertToCantor(vector['rho'], vector['theta'], vector['phi']);
// console.log('Cantor: ', cantor);
// console.log('Verify: ', convertToVector(cantor['a'], cantor['b'], cantor['c']));
