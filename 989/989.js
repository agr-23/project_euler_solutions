// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/989.py

const MOD = 1_000_000_009n;
const TARGET_LIMIT = 10n ** 14n;
const SMALL_NONPRIMITIVE_LIMIT = 8;

function modPow(base, exp, modulus) {
    let result = 1n;
    base = base % modulus;
    while (exp > 0n) {
        if (exp & 1n) result = result * base % modulus;
        exp >>= 1n;
        base = base * base % modulus;
    }
    return result;
}

function tonelliShanks(n, p) {
    if (n === 0n) return 0n;
    if (modPow(n, (p - 1n) / 2n, p) !== 1n) throw new Error("not a quadratic residue");
    if (p % 4n === 3n) return modPow(n, (p + 1n) / 4n, p);
    let q = p - 1n;
    let s = 0n;
    while (q % 2n === 0n) { q /= 2n; s++; }
    let z = 2n;
    while (modPow(z, (p - 1n) / 2n, p) !== p - 1n) z++;
    let m = s;
    let c = modPow(z, q, p);
    let t = modPow(n, q, p);
    let r = modPow(n, (q + 1n) / 2n, p);
    while (t !== 1n) {
        let i = 1n;
        let t2i = t * t % p;
        while (t2i !== 1n) { t2i = t2i * t2i % p; i++; }
        const b = modPow(c, 1n << (m - i - 1n), p);
        r = r * b % p;
        c = b * b % p;
        t = t * c % p;
        m = i;
    }
    return r;
}

function isqrt(n) {
    if (n === 0n) return 0n;
    let x = BigInt(Math.floor(Math.sqrt(Number(n))));
    while (x * x > n) x--;
    while ((x + 1n) * (x + 1n) <= n) x++;
    return x;
}

function gcd(a, b) {
    while (b !== 0n) { [a, b] = [b, a % b]; }
    return a;
}

const SQRT5_MOD = tonelliShanks(5n, MOD);
const INV_SQRT5_MOD = modPow(SQRT5_MOD, MOD - 2n, MOD);
const INV2_MOD = (MOD + 1n) / 2n;
const PHI_MOD = (1n + SQRT5_MOD) * INV2_MOD % MOD;
const PHI_INV_MOD = modPow(PHI_MOD, MOD - 2n, MOD);
const PSI_MOD = (1n - SQRT5_MOD + MOD) % MOD;
const PHI_SQUARED_MOD = PHI_MOD * PHI_MOD % MOD;
const PHI_INV_SQUARED_MOD = PHI_INV_MOD * PHI_INV_MOD % MOD;

function buildSmallNonprimitiveterms(maxLimit) {
    const values = [];
    const maxA = Number(isqrt(BigInt(maxLimit))) * 2 + 2;
    for (let a = 2; a <= maxA; a++) {
        for (let b = 1; b <= Math.floor(a / 2); b++) {
            const q = a * a - a * b - b * b;
            if (q > 0 && q <= maxLimit) values.push(q);
        }
    }
    values.sort((x, y) => x - y);
    const terms = [];
    for (let i = 0; i <= maxLimit; i++) terms.push([]);
    const prefix = [];
    let index = 0;
    const total = values.length;
    for (let limit = 0; limit <= maxLimit; limit++) {
        while (index < total && values[index] <= limit) {
            prefix.push(values[index]);
            index++;
        }
        terms[limit] = [...prefix];
    }
    return terms;
}

const SMALL_NONPRIMITIVE_TERMS = buildSmallNonprimitiveterms(SMALL_NONPRIMITIVE_LIMIT);

function evalSmallNonprimitivePair(limit, z1, z2) {
    const ts = SMALL_NONPRIMITIVE_TERMS[limit];
    let total1 = 0n, total2 = 0n;
    let power1 = 1n, power2 = 1n;
    let exponent = 0n;
    for (const target of ts) {
        const targetB = BigInt(target);
        while (exponent < targetB) {
            power1 = power1 * z1 % MOD;
            power2 = power2 * z2 % MOD;
            exponent++;
        }
        total1 += power1; if (total1 >= MOD) total1 -= MOD;
        total2 += power2; if (total2 >= MOD) total2 -= MOD;
    }
    return [total1, total2];
}

function mobiusSieve(limit) {
    const mu = new Int8Array(limit + 1).fill(1);
    const isPrime = new Uint8Array(limit + 1).fill(1);
    if (limit >= 0) isPrime[0] = 0;
    if (limit >= 1) isPrime[1] = 0;
    for (let p = 2; p <= limit; p++) {
        if (!isPrime[p]) continue;
        for (let multiple = p; multiple <= limit; multiple += p) mu[multiple] = -mu[multiple];
        const square = p * p;
        if (square <= limit) {
            for (let multiple = square; multiple <= limit; multiple += square) mu[multiple] = 0;
            for (let multiple = square; multiple <= limit; multiple += p) isPrime[multiple] = 0;
        }
        for (let multiple = p + p; multiple <= limit; multiple += p) isPrime[multiple] = 0;
    }
    return mu;
}

function nonprimitivePair(limit, z1, z1Inv, z2, z2Inv) {
    if (limit <= BigInt(SMALL_NONPRIMITIVE_LIMIT)) {
        return evalSmallNonprimitivePair(Number(limit), z1, z2);
    }
    const mod = MOD;
    let total1 = 0n, total2 = 0n;
    const z1Sq = z1 * z1 % mod;
    const z2Sq = z2 * z2 % mod;
    const z1InvSq = z1Inv * z1Inv % mod;
    const z2InvSq = z2Inv * z2Inv % mod;
    const z1Inv4 = z1InvSq * z1InvSq % mod;
    const z2Inv4 = z2InvSq * z2InvSq % mod;
    const z1Inv5 = z1Inv4 * z1Inv % mod;
    const z2Inv5 = z2Inv4 * z2Inv % mod;
    const z1Inv10 = z1Inv5 * z1Inv5 % mod;
    const z2Inv10 = z2Inv5 * z2Inv5 % mod;
    const z1Inv15 = z1Inv10 * z1Inv5 % mod;
    const z2Inv15 = z2Inv10 * z2Inv5 % mod;

    let evenWeight1 = z1Inv5, evenWeight2 = z2Inv5;
    let evenDelta1 = z1Inv15, evenDelta2 = z2Inv15;
    let addIndex = 0n, addTerm1 = 1n, addTerm2 = 1n, addStep1 = z1, addStep2 = z2;
    let dropIndex = 0n, dropTerm1 = 1n, dropTerm2 = 1n, dropStep1 = z1, dropStep2 = z2;
    let window1 = 0n, window2 = 0n;
    let t = 1n, lower = 3n, upper = 0n;
    let rhs = limit + 5n;
    while ((upper + 1n) * (upper + 1n) <= rhs) upper++;
    while (lower <= upper) {
        while (addIndex <= upper) {
            window1 += addTerm1; if (window1 >= mod) window1 -= mod;
            window2 += addTerm2; if (window2 >= mod) window2 -= mod;
            addTerm1 = addTerm1 * addStep1 % mod;
            addStep1 = addStep1 * z1Sq % mod;
            addTerm2 = addTerm2 * addStep2 % mod;
            addStep2 = addStep2 * z2Sq % mod;
            addIndex++;
        }
        while (dropIndex < lower) {
            window1 -= dropTerm1; if (window1 < 0n) window1 += mod;
            window2 -= dropTerm2; if (window2 < 0n) window2 += mod;
            dropTerm1 = dropTerm1 * dropStep1 % mod;
            dropStep1 = dropStep1 * z1Sq % mod;
            dropTerm2 = dropTerm2 * dropStep2 % mod;
            dropStep2 = dropStep2 * z2Sq % mod;
            dropIndex++;
        }
        total1 = (total1 + window1 * evenWeight1) % mod;
        total2 = (total2 + window2 * evenWeight2) % mod;
        evenWeight1 = evenWeight1 * evenDelta1 % mod;
        evenDelta1 = evenDelta1 * z1Inv10 % mod;
        evenWeight2 = evenWeight2 * evenDelta2 % mod;
        evenDelta2 = evenDelta2 * z2Inv10 % mod;
        rhs += 10n * t + 5n;
        t++;
        lower += 3n;
        while ((upper + 1n) * (upper + 1n) <= rhs) upper++;
    }

    let oddWeight1 = z1Inv, oddWeight2 = z2Inv;
    let oddDelta1 = z1Inv10, oddDelta2 = z2Inv10;
    addIndex = 0n; addTerm1 = 1n; addTerm2 = 1n; addStep1 = z1Sq; addStep2 = z2Sq;
    dropIndex = 0n; dropTerm1 = 1n; dropTerm2 = 1n; dropStep1 = z1Sq; dropStep2 = z2Sq;
    window1 = 0n; window2 = 0n;
    t = 0n; lower = 1n; upper = 0n;
    rhs = limit + 1n;
    while ((upper + 1n) * (upper + 2n) <= rhs) upper++;
    while (lower <= upper) {
        while (addIndex <= upper) {
            window1 += addTerm1; if (window1 >= mod) window1 -= mod;
            window2 += addTerm2; if (window2 >= mod) window2 -= mod;
            addTerm1 = addTerm1 * addStep1 % mod;
            addStep1 = addStep1 * z1Sq % mod;
            addTerm2 = addTerm2 * addStep2 % mod;
            addStep2 = addStep2 * z2Sq % mod;
            addIndex++;
        }
        while (dropIndex < lower) {
            window1 -= dropTerm1; if (window1 < 0n) window1 += mod;
            window2 -= dropTerm2; if (window2 < 0n) window2 += mod;
            dropTerm1 = dropTerm1 * dropStep1 % mod;
            dropStep1 = dropStep1 * z1Sq % mod;
            dropTerm2 = dropTerm2 * dropStep2 % mod;
            dropStep2 = dropStep2 * z2Sq % mod;
            dropIndex++;
        }
        total1 = (total1 + window1 * oddWeight1) % mod;
        total2 = (total2 + window2 * oddWeight2) % mod;
        oddWeight1 = oddWeight1 * oddDelta1 % mod;
        oddDelta1 = oddDelta1 * z1Inv10 % mod;
        oddWeight2 = oddWeight2 * oddDelta2 % mod;
        oddDelta2 = oddDelta2 * z2Inv10 % mod;
        rhs += 10n * t + 10n;
        t++;
        lower += 3n;
        while ((upper + 1n) * (upper + 2n) <= rhs) upper++;
    }
    return [total1, total2];
}

function solve(limit) {
    const limitB = BigInt(limit);
    const root = Number(isqrt(limitB));
    const mu = mobiusSieve(root);
    let pPhi = 0n, pPsi = 0n;
    let phiPowG2 = 1n, phiInvPowG2 = 1n;
    let forwardStep = PHI_MOD, backwardStep = PHI_INV_MOD;
    let gSquare = 1n;
    for (let g = 1; g <= root; g++) {
        const gB = BigInt(g);
        phiPowG2 = phiPowG2 * forwardStep % MOD;
        forwardStep = forwardStep * PHI_SQUARED_MOD % MOD;
        phiInvPowG2 = phiInvPowG2 * backwardStep % MOD;
        backwardStep = backwardStep * PHI_INV_SQUARED_MOD % MOD;
        const muG = mu[g];
        if (muG !== 0) {
            const scaledLimit = limitB / gSquare;
            let psiPowG2, psiInvPowG2;
            if (g & 1) {
                psiPowG2 = MOD - phiInvPowG2;
                psiInvPowG2 = MOD - phiPowG2;
            } else {
                psiPowG2 = phiInvPowG2;
                psiInvPowG2 = phiPowG2;
            }
            const [nonprimitivePhi, nonprimitivePsi] = nonprimitivePair(
                scaledLimit, phiPowG2, phiInvPowG2, psiPowG2, psiInvPowG2
            );
            if (muG === 1) {
                pPhi += nonprimitivePhi; if (pPhi >= MOD) pPhi -= MOD;
                pPsi += nonprimitivePsi; if (pPsi >= MOD) pPsi -= MOD;
            } else {
                pPhi -= nonprimitivePhi; if (pPhi < 0n) pPhi += MOD;
                pPsi -= nonprimitivePsi; if (pPsi < 0n) pPsi += MOD;
            }
        }
        gSquare += 2n * gB + 1n;
    }
    const diff = (pPhi - pPsi + MOD) % MOD;
    return diff * INV_SQRT5_MOD % MOD;
}

function bruteG(n) {
    let count = 0n;
    for (let x = 0n; x < n; x++) {
        if ((x * x - x - 1n + n * n) % n === 0n) count++;
    }
    return count;
}

function factorizeSmall(n) {
    const factors = [];
    let d = 2n;
    while (d * d <= n) {
        if (n % d === 0n) {
            let exponent = 0;
            while (n % d === 0n) { n /= d; exponent++; }
            factors.push([d, exponent]);
        }
        d += (d === 2n) ? 1n : 2n;
    }
    if (n > 1n) factors.push([n, 1]);
    return factors;
}

function gFromFactorization(n) {
    if (n === 1n) return 1n;
    let splitPrimeCount = 0;
    for (const [prime, exponent] of factorizeSmall(n)) {
        if (prime === 2n) return 0n;
        if (prime === 5n) {
            if (exponent >= 2) return 0n;
            continue;
        }
        const residue = prime % 5n;
        if (residue === 2n || residue === 3n) return 0n;
        splitPrimeCount++;
    }
    return 1n << BigInt(splitPrimeCount);
}

function reducedPairCount(n) {
    let count = 0n;
    const maxA = Number(isqrt(n)) * 2 + 2;
    for (let a = 2; a <= maxA; a++) {
        for (let b = 1; b <= Math.floor(a / 2); b++) {
            const ab = BigInt(a), bb = BigInt(b);
            if (gcd(ab, bb) !== 1n) continue;
            if (ab * ab - ab * bb - bb * bb === n) count++;
        }
    }
    return count;
}

function bruteNonprimitivePair(limit, z1, z2) {
    let total1 = 0n, total2 = 0n;
    const maxA = Number(isqrt(limit)) * 2 + 2;
    for (let a = 2; a <= maxA; a++) {
        for (let b = 1; b <= Math.floor(a / 2); b++) {
            const ab = BigInt(a), bb = BigInt(b);
            const q = ab * ab - ab * bb - bb * bb;
            if (q > 0n && q <= limit) {
                total1 = (total1 + modPow(z1, q, MOD)) % MOD;
                total2 = (total2 + modPow(z2, q, MOD)) % MOD;
            }
        }
    }
    return [total1, total2];
}

function bruteFibonacciSum(limit) {
    const n = Number(limit);
    const fib = new Array(n + 1).fill(0n);
    if (n >= 1) fib[1] = 1n;
    if (n >= 2) fib[2] = 1n;
    for (let i = 3; i <= n; i++) fib[i] = (fib[i - 1] + fib[i - 2]) % MOD;
    let total = 0n;
    for (let i = 1; i <= n; i++) total = (total + fib[i] * bruteG(BigInt(i))) % MOD;
    return total;
}

function validate() {
    console.assert(PSI_MOD === (MOD - PHI_INV_MOD) % MOD, "PSI_MOD check failed");
    for (let n = 1; n < 200; n++) {
        const nb = BigInt(n);
        const brute = bruteG(nb);
        const factorized = gFromFactorization(nb);
        const reduced = reducedPairCount(nb);
        console.assert(brute === factorized && brute === reduced, `n=${n}`);
    }
    for (let limit = 0; limit <= SMALL_NONPRIMITIVE_LIMIT; limit++) {
        const fastPair = evalSmallNonprimitivePair(limit, 2n, 3n);
        const brutePair = bruteNonprimitivePair(BigInt(limit), 2n, 3n);
        console.assert(fastPair[0] === brutePair[0] && fastPair[1] === brutePair[1], `limit=${limit}`);
    }
    for (const limit of [1n, 2n, 5n, 10n, 30n, 100n]) {
        const computed = solve(limit);
        const brute = bruteFibonacciSum(limit);
        console.assert(computed === brute, `limit=${limit}`);
    }
    console.assert(solve(1000n) === 190_950_976n, "solve(1000) failed");
}

validate();
console.log(solve(TARGET_LIMIT).toString());
