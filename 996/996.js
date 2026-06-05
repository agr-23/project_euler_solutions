// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/996.py

const MOD = 1234567891n;

function trim(poly) {
    while (poly.length > 1 && poly[poly.length - 1] === 0n) {
        poly.pop();
    }
    return poly;
}

function addTo(dst, src, modulus) {
    while (dst.length < src.length) dst.push(0n);
    if (modulus === null) {
        for (let i = 0; i < src.length; i++) dst[i] += src[i];
    } else {
        for (let i = 0; i < src.length; i++) dst[i] = (dst[i] + src[i]) % modulus;
    }
}

function mulOneMinusQ(poly, modulus) {
    const out = new Array(poly.length + 1).fill(0n);
    for (let i = 0; i < poly.length; i++) {
        out[i] += poly[i];
        out[i + 1] -= poly[i];
    }
    const result = modulus !== null ? out.map(v => v % modulus) : out;
    return trim(result);
}

function mulPoly(a, b, maxDegree, modulus) {
    if (!a.length || !b.length) return [0n];
    const outLen = Math.min(a.length + b.length - 2, maxDegree) + 1;
    const out = new Array(outLen).fill(0n);
    for (let i = 0; i < a.length; i++) {
        if (a[i] === 0n) continue;
        const lastJ = Math.min(b.length - 1, maxDegree - i);
        for (let j = 0; j <= lastJ; j++) {
            if (b[j] !== 0n) {
                out[i + j] += a[i] * b[j];
                if (modulus !== null) out[i + j] %= modulus;
            }
        }
    }
    const result = modulus !== null ? out.map(v => v % modulus) : out;
    return trim(result);
}

function comb(n, k) {
    if (k < 0n || k > n) return 0n;
    if (k === 0n || k === n) return 1n;
    if (k > n - k) k = n - k;
    let result = 1n;
    for (let i = 0n; i < k; i++) {
        result = result * (n - i) / (i + 1n);
    }
    return result;
}

function blockCount(length, cost) {
    if (cost <= 0n || 2n * cost < length) return 0n;
    const total = comb(2n * cost - 1n, length - 1n);
    const tooLarge = cost < length ? 0n : comb(cost - 1n, length - 1n);
    return total - length * tooLarge;
}

function blockNumerator(length, modulus) {
    const coeffs = new Array(length + 1).fill(0n);
    const lenB = BigInt(length);
    for (let j = 0; j <= length; j++) {
        let value = 0n;
        const jB = BigInt(j);
        for (let i = 0; i <= j; i++) {
            const iB = BigInt(i);
            const sign = i % 2 === 0 ? 1n : -1n;
            value += sign * comb(lenB, iB) * blockCount(lenB, jB - iB);
        }
        coeffs[j] = modulus !== null ? value % modulus : value;
    }
    return trim(coeffs);
}

function numeratorForAllValidVectors(n, modulus) {
    const blockNum = new Array(n + 1).fill(null);
    for (let length = 2; length <= n; length++) {
        blockNum[length] = blockNumerator(length, modulus);
    }

    const total = Array.from({ length: n + 1 }, () => []);
    const zeroEnd = Array.from({ length: n + 1 }, () => []);
    total[0] = [1n];
    zeroEnd[0] = [1n];

    for (let pos = 0; pos <= n; pos++) {
        if (pos < n && total[pos].length > 0) {
            const addZero = mulOneMinusQ(total[pos], modulus);
            addTo(total[pos + 1], addZero, modulus);
            addTo(zeroEnd[pos + 1], addZero, modulus);
        }
        if (zeroEnd[pos].length > 0) {
            for (let length = 2; length <= n - pos; length++) {
                const product = mulPoly(zeroEnd[pos], blockNum[length], pos + length, modulus);
                addTo(total[pos + length], product, modulus);
            }
        }
    }

    return total[n];
}

function countTuples(n, k, modulus) {
    const nB = BigInt(n);
    const kB = BigInt(k);
    const maxCost = kB / 2n;
    const numerator = numeratorForAllValidVectors(n, modulus);
    let answer = 0n;
    for (let degree = 0; degree < numerator.length; degree++) {
        const coeff = numerator[degree];
        if (coeff === 0n || BigInt(degree) > maxCost) continue;
        const waysUpToCost = comb(maxCost - BigInt(degree) + nB, nB);
        if (modulus === null) {
            answer += coeff * waysUpToCost;
        } else {
            answer = (answer + coeff * (waysUpToCost % modulus)) % modulus;
        }
    }
    return answer;
}

function runTests() {
    console.assert(countTuples(3, 4, null) === 8n, "Test 1 failed");
    console.assert(countTuples(12, 34, null) === 2457178250n, "Test 2 failed");
}

function main() {
    runTests();
    console.log(countTuples(123, 4567891, MOD).toString());
}

main();