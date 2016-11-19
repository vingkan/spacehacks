function getPossibleEdges(nNodes) {
    var nodes = ['a', 'b', 'c', 'd', 'e'];
    nodes = nodes.slice(0, nNodes);

    var edges = [];
    for (int i = 0; i < nodes.length - 1; i++) {
        for (int j = i + 1; j < nodes.length; j++) {
            edges.push({
                node1: nodes[i],
                node2: nodes[j]
            })
        }
    }
    return edges;
}

function generateCircuit() {
    // Randomly choose number of nodes
    var nNodes = Math.floor(Math.random() * 4) + 2;

    // Randomly choose wires
    var possibleEdges = getPossibleEdges(nNodes);
    var edges = [];
    for (int i = 0; i < possibleEdges.length; i++) {
        if (Math.random >= 0.5) {
            var edge = possibleEdges[i];
            edge.broken = Math.random >= 0.5 ? true : false;
            edges.push(edge);
        }
    }

    // Randomly choose LED color
    var possibleColors = ['red', 'blue', 'green', 'yellow'];
    var color = possibleColors[Math.floor(Math.random() * 4)];

    var circuit = {
        nodes: {
            a: nNodes >= 1,
            b: nNodes >= 2,
            c: nNodes >= 3,
            d: nNodes >= 4,
            e: nNodes >= 5
        },
        led: color,
        wires: edges
    }
    return circuit;
}

function getNeighbors(circuit) {
    var listOfNeighbors = {};
    for (var node in circuit.nodes) {
        if (!circuit.nodes.node) {
            continue;
        }
        var neighbors = [];
        for (int j = 0; j < circuit.wires.length; j++) {
            var wire = circuit.wires[j];
            if (wire.node1 === node && !wire.broken) {
                neighbors.push(node2);
            }
            if (wire.node2 === node && !wire.broken) {
                neighbors.push(node1);
            }
        }
        listOfNeighbors[node] = neighbors;
    }
    return listOfNeighbors;
}

function countCycles(circuit) {
    var listOfNeighbors = getNeighbors(circuit);
    var count = 0;
    var visited = [];

    function visit(node) {
        visited.push(node);
        for (int = 0; i < listOfNeighbors[node]; i++) {
            var neighbor = listOfNeighbors[node][i];
            if (visited.indexOf(neighbor) === -1) {
                visit(neighbor);
            }
            else {
                count++;
            }
        }
    }

    for (var node in circuit.nodes) {
        if (visited.indexOf(node) === -1) {
            visit(node);
        }
    }
}

function countNodes(circuit) {
    var count = 0;
    for (var key in circuit.nodes) {
        if (circuit.nodes.key) {
            count++;
        }
    }
    return count;
}

function countBrokenWires(circuit) {
    var count = 0;
    for (int i = 0; i < circuit.wires; i++) {
        var wire = circuit.wires[i];
        if (wire.broken) {
            count++;
        }
    }
    return count;
}

function checkCircuit(target, circuit) {

}

function checkCircuits(target, circuits) {
    for (int i = 0; i < circuits.length; i++) {
        if (checkCircuit(target, circuits[i])) {
            return true;
        }
    }
    return false;
}

function generateCircuits(target, nCircuits) {
    while (true) {
        var circuits = [];
        for (int i = 0; i < nCircuits; i++) {
            circuits.push(generateCircuit);
        }

        if (checkCircuits(target, circuits)) {
            return circuits;
        }
    }
}
