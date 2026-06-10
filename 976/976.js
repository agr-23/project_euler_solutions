// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/976.py

const MODVAL = 1234567891n;

function buildInverses(n, mod) {
    const inv = new Array(n + 1).fill(0n);
    if (n >= 1) {
        inv[1] = 1n;
    }
    for (let i = 2; i <= n; i++) {
        inv[i] = mod - (mod / BigInt(i)) * inv[Number(mod % BigInt(i))] % mod;
    }
    return inv;
}

function solve() {
    const n = 10_000_000n;
    const k = 10_000_000n;
    const e = n / 2n;
    const aCnt = (n + 3n) / 4n;
    const bCnt = (n + 1n) / 4n;
    const c = bCnt - aCnt;

    if (e === 0n) {
        const inv = buildInverses(Number(k + 2n), MODVAL);
        const inv2 = (MODVAL + 1n) / 2n;
        let h = 1n;
        let q = 1n;
        let sumOddA = 0n;
        let ans = 0n;
        for (let s = 0n; s <= k; s++) {
            if (s > 0n) {
                h = h * (aCnt + bCnt + s - 1n) % MODVAL * inv[Number(s)] % MODVAL;
                if (s % 2n === 0n) {
                    const r = s / 2n;
                    q = q * (aCnt + r - 1n) % MODVAL * inv[Number(r)] % MODVAL;
                }
            }
            let coeff;
            if (c === 0n) {
                coeff = (s % 2n === 0n) ? q : 0n;
            } else if (c === 1n) {
                coeff = q;
            } else {
                coeff = (s % 2n === 0n) ? q : (MODVAL - q);
            }
            const hOddA = (h - coeff + MODVAL) % MODVAL * inv2 % MODVAL;
            sumOddA = (sumOddA + hOddA) % MODVAL;
            ans = sumOddA;
        }
        console.log(String(ans % MODVAL));
        return;
    }

    const maxInv = Number(e + k + 2n);
    const inv = buildInverses(maxInv, MODVAL);
    const inv2 = (MODVAL + 1n) / 2n;

    let totalEven = 1n;
    for (let m = 0n; m < k; m++) {
        totalEven = totalEven * (e + m) % MODVAL * inv[Number(m + 1n)] % MODVAL;
    }

    const qmax = k / 2n;
    let e0 = 1n;
    for (let q2 = 0n; q2 < qmax; q2++) {
        e0 = e0 * (e + q2) % MODVAL * inv[Number(q2 + 1n)] % MODVAL;
    }

    let h = 1n;
    let q = 1n;
    let qsum = 1n;
    let sumEven = 0n;
    let sumOdd = 0n;
    let sumOddA = 0n;
    let ans = 0n;
    const ab = aCnt + bCnt;

    for (let s = 0n; s <= k; s++) {
        if (s > 0n) {
            h = h * (ab + s - 1n) % MODVAL * inv[Number(s)] % MODVAL;
            if (s % 2n === 0n) {
                const r = s / 2n;
                q = q * (aCnt + r - 1n) % MODVAL * inv[Number(r)] % MODVAL;
                if (c === 1n) {
                    qsum = qsum * (aCnt + r) % MODVAL * inv[Number(r)] % MODVAL;
                }
            }
        }
        let coeff;
        if (c === 0n) {
            coeff = (s % 2n === 0n) ? q : 0n;
        } else if (c === 1n) {
            coeff = qsum;
        } else {
            coeff = (s % 2n === 0n) ? q : (MODVAL - q);
        }
        const hOddA = (h - coeff + MODVAL) % MODVAL * inv2 % MODVAL;
        if (s % 2n === 0n) {
            sumEven = (sumEven + h) % MODVAL;
        } else {
            sumOdd = (sumOdd + h) % MODVAL;
        }
        sumOddA = (sumOddA + hOddA) % MODVAL;
        const m = k - s;
        let t0, t1;
        if (m % 2n === 0n) {
            const e0m = e0;
            t0 = e0m * sumOddA % MODVAL;
            t1 = (totalEven - e0m + MODVAL) % MODVAL * sumEven % MODVAL;
        } else {
            t0 = 0n;
            t1 = totalEven * sumOdd % MODVAL;
        }
        ans = (ans + t0 + t1) % MODVAL;
        if (m > 0n) {
            totalEven = totalEven * m % MODVAL * inv[Number(e + m - 1n)] % MODVAL;
        }
        if (m % 2n === 0n && m >= 2n) {
            const qcur = m / 2n;
            e0 = e0 * qcur % MODVAL * inv[Number(e + qcur - 1n)] % MODVAL;
        }
    }
    console.log(String(ans % MODVAL));
}

solve();
