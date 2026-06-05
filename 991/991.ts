// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/991.py

const LIMIT: number = 10_000_000;

function gcd(a: bigint, b: bigint): bigint {
    while (b !== 0n) { [a, b] = [b, a % b]; }
    return a;
}

function isqrt(n: bigint): bigint {
    if (n < 0n) return 0n;
    let x = BigInt(Math.floor(Math.sqrt(Number(n))));
    while (x * x > n) x -= 1n;
    while ((x + 1n) * (x + 1n) <= n) x += 1n;
    return x;
}

function primitiveSolutions(limit: number): bigint[] {
    const limitB = BigInt(limit);
    const sums: bigint[] = [];

    const mMax = isqrt(limitB / 4n) + 2n;
    for (let m = 1n; m <= mMax; m++) {
        const nMin = isqrt(3n * m * m) + 1n;
        const nMax = 2n * m - 1n;
        for (let n = nMin; n <= nMax; n++) {
            if (gcd(m, n) !== 1n) continue;
            const a = 4n * m * m - n * n;
            const c = n * n - 3n * m * m;
            const b = 5n * m * m - n * n + m * n;
            const s = a + b + c;
            if (a <= 0n || b <= 0n || c <= 0n) continue;
            if (s <= limitB) sums.push(s);
        }
    }

    const alpha: number = 2.0 + Math.sqrt(3.0);
    const beta: number = (5.0 + Math.sqrt(21.0)) / 2.0;
    let k = 1n;
    while (true) {
        let low = BigInt(Math.floor(alpha * Number(k))) + 1n;
        while ((2n * low - k) * (2n * low - k) <= 3n * low * low) {
            low += 1n;
        }
        let highPos = BigInt(Math.floor(beta * Number(k)));
        while (highPos > 0n && !(-highPos * highPos + 5n * highPos * k - k * k > 0n)) {
            highPos -= 1n;
        }
        const highSum = (limitB + k * k) / (5n * k);
        const high = highPos < highSum ? highPos : highSum;
        if (low > highSum) break;
        for (let m = low; m <= high; m++) {
            if (gcd(m, k) !== 1n) continue;
            const n = 2n * m - k;
            const a = 4n * m * m - n * n;
            const c = n * n - 3n * m * m;
            const b = 5n * m * m - n * n - m * n;
            const s = a + b + c;
            if (a <= 0n || b <= 0n || c <= 0n) continue;
            if (s <= limitB) sums.push(s);
        }
        k += 1n;
    }

    return sums;
}

function solve(limit: number): bigint {
    const limitB = BigInt(limit);
    const primitive = primitiveSolutions(limit);
    let total = 0n;
    for (const s of primitive) {
        const count = limitB / s;
        total += s * count * (count + 1n) / 2n;
    }
    return total;
}

function bruteForce(limit: number): bigint {
    let total = 0n;
    const lim = BigInt(limit);
    for (let a = 1n; a <= lim; a++) {
        for (let b = 1n; b <= lim - a; b++) {
            const maxC = lim - a - b;
            for (let c = 1n; c <= maxC; c++) {
                const lhsNum = a * (a + c) + (b + c) * (b + c);
                const lhsDen = (b + c) * (a + c);
                if (lhsNum === 4n * lhsDen) {
                    total += a + b + c;
                }
            }
        }
    }
    return total;
}

function runTests(): void {
    const m = 4n, n = 7n;
    console.assert(
        (4n*m*m - n*n) === 15n &&
        (5n*m*m - n*n - m*n) === 3n &&
        (n*n - 3n*m*m) === 1n,
        "minus branch primitive check failed"
    );
    console.assert(
        (4n*m*m - n*n) === 15n &&
        (5n*m*m - n*n + m*n) === 59n &&
        (n*n - 3n*m*m) === 1n,
        "plus branch primitive check failed"
    );
    console.assert(solve(18) === 0n, "solve(18) failed");
    console.assert(solve(19) === bruteForce(19), "solve(19) failed");
    console.assert(solve(75) === bruteForce(75), "solve(75) failed");
    console.assert(solve(200) === bruteForce(200), "solve(200) failed");
}

runTests();
console.log(solve(LIMIT).toString());
