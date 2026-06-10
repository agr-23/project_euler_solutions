// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/977.py

const MODVAL: u64 = 1_000_000_007;

fn modpow(mut base: u64, mut exp: u64, modulus: u64) -> u64 {
    let mut result: u64 = 1;
    base %= modulus;
    while exp > 0 {
        if exp % 2 == 1 {
            result = ((result as u128 * base as u128) % modulus as u128) as u64;
        }
        exp /= 2;
        base = ((base as u128 * base as u128) % modulus as u128) as u64;
    }
    result
}

fn compute_mod(n: i64) -> u64 {
    if n == 1 {
        return 1;
    }
    let mut total: u64 = 0;
    let m_val = n - 2;
    let sum_q = (m_val * (m_val + 1) * (2 * m_val + 1) / 6 + m_val * (m_val + 1) / 2) as u64 % MODVAL;
    total = (sum_q + n as u64) % MODVAL;
    for l_val in 2i64..=n {
        let r_val = n - l_val;
        if r_val >= 1 {
            let q_full = (r_val - 1) / l_val;
            let max_a = q_full + 2;
            let mut pow_a: Vec<u64> = vec![0u64; (max_a + 1) as usize];
            if l_val == 2 {
                for a in 1i64..=max_a {
                    pow_a[a as usize] = (a as u64 * a as u64) % MODVAL;
                }
            } else if l_val == 3 {
                for a in 1i64..=max_a {
                    let aa = (a as u64 * a as u64) % MODVAL;
                    pow_a[a as usize] = (aa * a as u64) % MODVAL;
                }
            } else {
                for a in 1i64..=max_a {
                    pow_a[a as usize] = modpow(a as u64, l_val as u64, MODVAL);
                }
            }
            for q in 0i64..q_full {
                let a_val = q + 1;
                let b_val = q + 2;
                let al = pow_a[a_val as usize];
                let bl = pow_a[b_val as usize];
                let al1 = ((al as u128 * a_val as u128) % MODVAL as u128) as u64;
                let t1 = ((q as u128 * al as u128) % MODVAL as u128) as u64;
                let t2 = (((a_val as u128 * a_val as u128) % MODVAL as u128) * bl as u128 % MODVAL as u128) as u64;
                let t3 = ((b_val as u128 * al1 as u128) % MODVAL as u128) as u64;
                let term = (t1 + t2 + MODVAL - t3) % MODVAL;
                total = (total + term) % MODVAL;
            }
            {
                let q = q_full;
                let m_inner = (r_val - 1) - q_full * l_val;
                let a_val = q + 1;
                let b_val = q + 2;
                let al = pow_a[a_val as usize];
                let mut term = ((q as u128 * al as u128) % MODVAL as u128) as u64;
                if m_inner >= 1 {
                    let al1 = ((al as u128 * a_val as u128) % MODVAL as u128) as u64;
                    let exp_val = l_val + 1 - m_inner;
                    let al1m = match exp_val {
                        1 => a_val as u64 % MODVAL,
                        2 => ((a_val as u128 * a_val as u128) % MODVAL as u128) as u64,
                        3 => {
                            let tmp = ((a_val as u128 * a_val as u128) % MODVAL as u128) as u64;
                            ((tmp as u128 * a_val as u128) % MODVAL as u128) as u64
                        }
                        _ => modpow(a_val as u64, exp_val as u64, MODVAL),
                    };
                    let bm = match m_inner {
                        1 => b_val as u64 % MODVAL,
                        2 => ((b_val as u128 * b_val as u128) % MODVAL as u128) as u64,
                        3 => {
                            let tmp = ((b_val as u128 * b_val as u128) % MODVAL as u128) as u64;
                            ((tmp as u128 * b_val as u128) % MODVAL as u128) as u64
                        }
                        _ => modpow(b_val as u64, m_inner as u64, MODVAL),
                    };
                    let inner = (((al1m as u128 * bm as u128) % MODVAL as u128) as u64 + MODVAL - al1) % MODVAL;
                    let add = ((b_val as u128 * inner as u128) % MODVAL as u128) as u64;
                    term = (term + add) % MODVAL;
                }
                total = (total + term) % MODVAL;
            }
        }
        let q = r_val / l_val;
        let r = r_val - q * l_val;
        let a_val = q + 1;
        let b_val = q + 2;
        let base_val = if r == 0 {
            modpow(a_val as u64, l_val as u64, MODVAL)
        } else {
            let pa = modpow(a_val as u64, (l_val - r) as u64, MODVAL);
            let pb = modpow(b_val as u64, r as u64, MODVAL);
            ((pa as u128 * pb as u128) % MODVAL as u128) as u64
        };
        total = (total + base_val) % MODVAL;
    }
    total % MODVAL
}

fn compute_exact(n: i64) -> i128 {
    if n == 1 {
        return 1;
    }
    let mut total: i128 = 0;
    let m_val = n - 2;
    let sum_q = (m_val * (m_val + 1) * (2 * m_val + 1) / 6 + m_val * (m_val + 1) / 2) as i128;
    total = sum_q + n as i128;
    for l_val in 2i64..=n {
        let r_val = n - l_val;
        if r_val >= 1 {
            let q_full = (r_val - 1) / l_val;
            let max_a = q_full + 2;
            let mut pow_a: Vec<i128> = vec![0i128; (max_a + 1) as usize];
            for a in 1i64..=max_a {
                pow_a[a as usize] = (a as i128).pow(l_val as u32);
            }
            for q in 0i64..q_full {
                let a_val = q + 1;
                let b_val = q + 2;
                let al = pow_a[a_val as usize];
                let bl = pow_a[b_val as usize];
                let term = q as i128 * al + (a_val as i128 * a_val as i128) * bl - b_val as i128 * (al * a_val as i128);
                total += term;
            }
            {
                let q = q_full;
                let m_inner = (r_val - 1) - q_full * l_val;
                let a_val = q + 1;
                let b_val = q + 2;
                let al = pow_a[a_val as usize];
                let mut term = q as i128 * al;
                if m_inner >= 1 {
                    let al1 = al * a_val as i128;
                    let al1m = (a_val as i128).pow((l_val + 1 - m_inner) as u32);
                    let bm = (b_val as i128).pow(m_inner as u32);
                    term += b_val as i128 * (al1m * bm - al1);
                }
                total += term;
            }
        }
        let q = r_val / l_val;
        let r = r_val - q * l_val;
        let a_val = q + 1;
        let b_val = q + 2;
        let base_val = (a_val as i128).pow((l_val - r) as u32) * (b_val as i128).pow(r as u32);
        total += base_val;
    }
    total
}

fn main() {
    assert_eq!(compute_exact(3), 8, "assert failed: compute_exact(3)");
    assert_eq!(compute_exact(7), 174, "assert failed: compute_exact(7)");
    assert_eq!(compute_exact(100), 570271270297640131, "assert failed: compute_exact(100)");
    let n = 1_000_000i64;
    println!("{}", compute_mod(n));
}
