// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/997.py

function compute(px, py, pz) {
    return 3n * (1n << (px + py + pz - 1n)) * ((1n << px) + (1n << py) + (1n << pz) - 4n);
}

function main() {
    console.assert(compute(1n, 1n, 1n) === 24n);
    console.assert(compute(2n, 3n, 4n) === 18432n);
    console.log(compute(9n, 10n, 11n).toString());
}

main();