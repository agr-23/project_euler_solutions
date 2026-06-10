// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/976.py

const MODVAL: bigint = 1234567891n;

function buildInverses(n: number, mod: bigint): bigint[] {
    const inv: bigint[] = new Array(n + 1).fill(0n);
    if (n >= 1) {
        inv[1] = 1n;
    }
    for (let i = 2; i <= n; i++) {
        inv[i] = mod - (mod / BigInt(i)) * inv[Number(mod % BigInt(i))] % mod;
    }
    return inv;
}

function solve(): void {
    const n: bigint = 10_000_000n;
    const k: bigint = 10_000_000n;
    const e: bigint = n / 2n;
    const aCnt: bigint = (n + 3n) / 4n;
    const bCnt: bigint = (n + 1n) / 4n;
    const c: bigint = bCnt - aCnt;

    if (e === 0n) {
        const inv: bigint[] = buildInverses(Number(k + 2n), MODVAL);
        const inv2: bigint = (MODVAL + 1n) / 2n;
        let h: bigint = 1n;
        let q: bigint = 1n;
        let sumOddA: bigint = 0n;
        let ans: bigint = 0n;
        for (let s: bigint = 0n; s <= k; s++) {
            if (s > 0n) {
                h = h * (aCnt + bCnt + s - 1n) % MODVAL * inv[Number(s)] % MODVAL;
                if (s % 2n === 0n) {
                    const r: bigint = s / 2n;
                    q = q * (aCnt + r - 1n) % MODVAL * inv[Number(r)] % MODVAL;
                }
            }
            let coeff: bigint;
            if (c === 0n) {
                coeff = (s % 2n === 0n) ? q : 0n;
            } else if (c === 1n) {
                coeff = q;
            } else {
                coeff = (s % 2n === 0n) ? q : (MODVAL - q);
            }
            const hOddA: bigint = (h - coeff + MODVAL) % MODVAL * inv2 % MODVAL;
            sumOddA = (sumOddA + hOddA) % MODVAL;
            ans = sumOddA;
        }
        console.log(String(ans % MODVAL));
        return;
    }

    const maxInv: number = Number(e + k + 2n);
    const inv: bigint[] = buildInverses(maxInv, MODVAL);
    const inv2: bigint = (MODVAL + 1n) / 2n;

    let totalEven: bigint = 1n;
    for (let m: bigint = 0n; m < k; m++) {
        totalEven = totalEven * (e + m) % MODVAL * inv[Number(m + 1n)] % MODVAL;
    }

    const qmax: bigint = k / 2n;
    let e0: bigint = 1n;
    for (let q2: bigint = 0n; q2 < qmax; q2++) {
        e0 = e0 * (e + q2) % MODVAL * inv[Number(q2 + 1n)] % MODVAL;
    }

    let h: bigint = 1n;
    let q: bigint = 1n;
    let qsum: bigint = 1n;
    let sumEven: bigint = 0n;
    let sumOdd: bigint = 0n;
    let sumOddA: bigint = 0n;
    let ans: bigint = 0n;
    const ab: bigint = aCnt + bCnt;

    for (let s: bigint = 0n; s <= k; s++) {
        if (s > 0n) {
            h = h * (ab + s - 1n) % MODVAL * inv[Number(s)] % MODVAL;
            if (s % 2n === 0n) {
                const r: bigint = s / 2n;
                q = q * (aCnt + r - 1n) % MODVAL * inv[Number(r)] % MODVAL;
                if (c === 1n) {
                    qsum = qsum * (aCnt + r) % MODVAL * inv[Number(r)] % MODVAL;
                }
            }
        }
        let coeff: bigint;
        if (c === 0n) {
            coeff = (s % 2n === 0n) ? q : 0n;
        } else if (c === 1n) {
            coeff = qsum;
        } else {
            coeff = (s % 2n === 0n) ? q : (MODVAL - q);
        }
        const hOddA: bigint = (h - coeff + MODVAL) % MODVAL * inv2 % MODVAL;
        if (s % 2n === 0n) {
            sumEven = (sumEven + h) % MODVAL;
        } else {
            sumOdd = (sumOdd + h) % MODVAL;
        }
        sumOddA = (sumOddA + hOddA) % MODVAL;
        const m: bigint = k - s;
        let t0: bigint;
        let t1: bigint;
        if (m % 2n === 0n) {
            const e0m: bigint = e0;
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
            const qcur: bigint = m / 2n;
            e0 = e0 * qcur % MODVAL * inv[Number(e + qcur - 1n)] % MODVAL;
        }
    }
    console.log(String(ans % MODVAL));
}

solve();
