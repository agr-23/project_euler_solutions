// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/994.py

use std::collections::HashMap;
use std::env;

const MOD: u64 = 1_000_000_007;
const INV2: u64 = (MOD + 1) / 2;

fn inv6() -> u64 {
    mod_pow(6, MOD - 2, MOD)
}

fn mod_pow(mut base: u64, mut exp: u64, modulus: u64) -> u64 {
    let mut result = 1u64;
    base %= modulus;
    while exp > 0 {
        if exp & 1 == 1 {
            result = result * base % modulus;
        }
        exp >>= 1;
        base = base * base % modulus;
    }
    result
}

fn c2_mod(x: i64, inv6: u64) -> u64 {
    let _ = inv6;
    let xm = ((x % MOD as i64 + MOD as i64) as u64) % MOD;
    let xm1 = ((xm as i64 - 1 + MOD as i64) as u64) % MOD;
    xm * xm1 % MOD * INV2 % MOD
}

fn c3_mod(x: i64, inv6: u64) -> u64 {
    let xm = ((x % MOD as i64 + MOD as i64) as u64) % MOD;
    let xm1 = ((xm as i64 - 1 + MOD as i64) as u64) % MOD;
    let xm2 = ((xm as i64 - 2 + MOD as i64) as u64) % MOD;
    xm * xm1 % MOD * xm2 % MOD * inv6 % MOD
}

fn p1(n: i64) -> u64 {
    let nm = ((n % MOD as i64 + MOD as i64) as u64) % MOD;
    let nm1 = (nm + 1) % MOD;
    nm * nm1 % MOD * INV2 % MOD
}

fn p2(n: i64, inv6: u64) -> u64 {
    let nm = ((n % MOD as i64 + MOD as i64) as u64) % MOD;
    let nm1 = (nm + 1) % MOD;
    let two_nm1 = (2 * nm + 1) % MOD;
    nm * nm1 % MOD * two_nm1 % MOD * inv6 % MOD
}

fn p3(n: i64) -> u64 {
    let s = p1(n);
    s * s % MOD
}

struct TotientPrefix {
    limit: usize,
    pref0: Vec<u32>,
    pref1: Vec<u32>,
    pref2: Vec<u32>,
    cache: HashMap<i64, (u64, u64, u64)>,
    inv6: u64,
}

impl TotientPrefix {
    fn new(limit: usize, inv6: u64) -> Self {
        let (pref0, pref1, pref2) = Self::build(limit, inv6);
        TotientPrefix {
            limit,
            pref0,
            pref1,
            pref2,
            cache: HashMap::new(),
            inv6,
        }
    }

    fn build(limit: usize, _inv6: u64) -> (Vec<u32>, Vec<u32>, Vec<u32>) {
        let mut phi: Vec<u64> = (0..=limit as u64).collect();
        for p in 2..=limit {
            if phi[p] == p as u64 {
                let mut j = p;
                while j <= limit {
                    phi[j] -= phi[j] / p as u64;
                    j += p;
                }
            }
        }
        let mut pref0 = vec![0u32; limit + 1];
        let mut pref1 = vec![0u32; limit + 1];
        let mut pref2 = vec![0u32; limit + 1];
        let mut s0: u64 = 0;
        let mut s1: u64 = 0;
        let mut s2: u64 = 0;
        for i in 1..=limit {
            let ph = phi[i] % MOD;
            let im = (i as u64) % MOD;
            s0 = (s0 + ph) % MOD;
            s1 = (s1 + im * ph) % MOD;
            s2 = (s2 + im * im % MOD * ph) % MOD;
            pref0[i] = s0 as u32;
            pref1[i] = s1 as u32;
            pref2[i] = s2 as u32;
        }
        (pref0, pref1, pref2)
    }

    fn values(&mut self, n: i64) -> (u64, u64, u64) {
        if n <= 0 {
            return (0, 0, 0);
        }
        if n <= self.limit as i64 {
            return (
                self.pref0[n as usize] as u64,
                self.pref1[n as usize] as u64,
                self.pref2[n as usize] as u64,
            );
        }
        if let Some(&cached) = self.cache.get(&n) {
            return cached;
        }
        let mut f0 = p1(n);
        let mut f1 = p2(n, self.inv6);
        let mut f2 = p3(n);
        let mut l: i64 = 2;
        while l <= n {
            let q = n / l;
            let r = n / q;
            let sum_0 = ((r - l + 1) % MOD as i64 + MOD as i64) as u64 % MOD;
            let sum_1 = (p1(r) + MOD - p1(l - 1)) % MOD;
            let sum_2 = (p2(r, self.inv6) + MOD - p2(l - 1, self.inv6)) % MOD;
            let (sub0, sub1, sub2) = self.values(q);
            f0 = (f0 + MOD - sum_0 * sub0 % MOD) % MOD;
            f1 = (f1 + MOD - sum_1 * sub1 % MOD) % MOD;
            f2 = (f2 + MOD - sum_2 * sub2 % MOD) % MOD;
            l = r + 1;
        }
        let out = (f0, f1, f2);
        self.cache.insert(n, out);
        out
    }
}

fn nonconcurrent_candidate_count(m: i64, n: i64, inv6: u64) -> u64 {
    let mm = ((m % MOD as i64 + MOD as i64) as u64) % MOD;
    let mm1 = ((m - 1) % MOD as i64 + MOD as i64) as u64 % MOD;
    let nm = ((n % MOD as i64 + MOD as i64) as u64) % MOD;
    let nm1 = ((n - 1) % MOD as i64 + MOD as i64) as u64 % MOD;
    let np1 = ((n + 1) % MOD as i64 + MOD as i64) as u64 % MOD;
    let two_same_bottom = mm * mm1 % MOD * nm % MOD * nm1 % MOD * np1 % MOD * inv6 % MOD;
    let c3n2 = c3_mod(n + 2, inv6);
    let nm2 = nm;
    let distinct_bottoms = c3_mod(m, inv6) * ((c3n2 + MOD - nm2) % MOD) % MOD;
    (two_same_bottom + distinct_bottoms) % MOD
}

fn weighted_gcd_sum(m: i64, n: i64, tp: &mut TotientPrefix) -> u64 {
    let m1 = m - 1;
    let n1 = n - 1;
    let upper = m1.min(n1);
    let mut total: u64 = 0;
    let mut l: i64 = 1;
    while l <= upper {
        let qm = m1 / l;
        let qn = n1 / l;
        let r = (m1 / qm).min(n1 / qn).min(upper);
        let (r0, r1, r2) = tp.values(r);
        let (l0, l1, l2) = tp.values(l - 1);
        let s0 = (r0 + MOD - l0) % MOD;
        let s1 = (r1 + MOD - l1) % MOD;
        let s2 = (r2 + MOD - l2) % MOD;
        let qm_mod = (qm as u64) % MOD;
        let qn_mod = (qn as u64) % MOD;
        let mm = (m as u64) % MOD;
        let nm = (n as u64) % MOD;
        let a0m = qm_mod * mm % MOD;
        let a1m = (MOD - qm_mod * ((qm as u64 + 1) % MOD) % MOD * INV2 % MOD) % MOD;
        let a0n = qn_mod * nm % MOD;
        let a1n = (MOD - qn_mod * ((qn as u64 + 1) % MOD) % MOD * INV2 % MOD) % MOD;
        let c0 = a0m * a0n % MOD;
        let c1 = (a0m * a1n + a1m * a0n) % MOD;
        let c2 = a1m * a1n % MOD;
        total = (total + c0 * s0 % MOD + c1 * s1 % MOD + c2 * s2 % MOD) % MOD;
        l = r + 1;
    }
    total
}

fn concurrent_triple_count(m: i64, n: i64, tp: &mut TotientPrefix, inv6: u64) -> u64 {
    let gcd_part = weighted_gcd_sum(m, n, tp);
    let ep = c2_mod(m, inv6) * c2_mod(n, inv6) % MOD;
    (gcd_part + MOD - ep) % MOD
}

fn t_func(m: i64, n: i64, tp: &mut TotientPrefix, inv6: u64) -> u64 {
    let ncc = nonconcurrent_candidate_count(m, n, inv6);
    let ctc = concurrent_triple_count(m, n, tp, inv6);
    (ncc + MOD - ctc) % MOD
}

fn main() {
    let sieve_limit: usize = env::var("SIEVE_LIMIT")
        .unwrap_or_else(|_| "10000000".to_string())
        .parse()
        .unwrap_or(10_000_000);
    let inv6 = inv6();
    let mut tp = TotientPrefix::new(sieve_limit, inv6);
    assert_eq!(t_func(2, 3, &mut tp, inv6), 8);
    assert_eq!(t_func(3, 5, &mut tp, inv6), 146);
    assert_eq!(t_func(12, 23, &mut tp, inv6), 756716);
    println!("{}", t_func(1234 * 10_i64.pow(8), 2345 * 10_i64.pow(8), &mut tp, inv6));
}
