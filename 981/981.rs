// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/981.py

const MODVAL: u64 = 888888883u64;

fn qbinom_minus1_int(n: i64, k: i64) -> u128 {
    if (n & 1) == 0 && (k & 1) == 1 {
        return 0;
    }
    big_comb((n >> 1) as i64, (k >> 1) as i64)
}

fn big_comb(n: i64, k: i64) -> u128 {
    if k < 0 || k > n {
        return 0;
    }
    if k == 0 || k == n {
        return 1;
    }
    let mut num: u128 = 1;
    let mut den: u128 = 1;
    let kk = if k < n - k { k } else { n - k };
    for i in 0..kk {
        num = num * (n - i) as u128;
        den = den * (i + 1) as u128;
    }
    num / den
}

fn big_factorial(n: i64) -> u128 {
    let mut result: u128 = 1;
    for i in 2..=(n as u128) {
        result *= i;
    }
    result
}

fn n_exact(x: i64, y: i64, z: i64) -> u128 {
    if (x & 1) != (y & 1) || (y & 1) != (z & 1) {
        return 0;
    }
    let n = x + y + z;
    let total = big_factorial(n) / (big_factorial(x) * big_factorial(y) * big_factorial(z));
    let diff = qbinom_minus1_int(n, x) * qbinom_minus1_int(n - x, y);
    let half_sum = ((x >> 1) + (y >> 1) + (z >> 1)) & 1;
    if half_sum == 0 {
        (total + diff) / 2
    } else {
        (total - diff) / 2
    }
}

fn modpow(mut base: u64, mut exp: u64, modulus: u64) -> u64 {
    let mut result: u64 = 1;
    base %= modulus;
    while exp > 0 {
        if exp & 1 == 1 {
            result = ((result as u128 * base as u128) % modulus as u128) as u64;
        }
        base = ((base as u128 * base as u128) % modulus as u128) as u64;
        exp >>= 1;
    }
    result
}

fn mulmod(a: u64, b: u64, modulus: u64) -> u64 {
    ((a as u128 * b as u128) % modulus as u128) as u64
}

fn main_solve() -> u64 {
    let assert1 = n_exact(2, 2, 2);
    assert_eq!(assert1, 42u128, "Assert 1 failed");
    let assert2 = n_exact(8, 8, 8);
    assert_eq!(assert2, 4732773210u128, "Assert 2 failed");

    let cubes: Vec<usize> = (0..88usize).map(|i| i * i * i).collect();
    let max_n = 3 * cubes[87];

    let mut fact = vec![0u64; max_n + 1];
    fact[0] = 1;
    for i in 1..=max_n {
        fact[i] = ((fact[i - 1] as u128 * i as u128) % MODVAL as u128) as u64;
    }

    let mut invfact = vec![0u64; max_n + 1];
    invfact[max_n] = modpow(fact[max_n], MODVAL - 2, MODVAL);
    for i in (1..=max_n).rev() {
        invfact[i - 1] = ((invfact[i] as u128 * i as u128) % MODVAL as u128) as u64;
    }

    let inv2 = (MODVAL + 1) / 2;

    let halves: Vec<usize> = cubes.iter().map(|&c| c >> 1).collect();
    let invf: Vec<u64> = cubes.iter().map(|&c| invfact[c]).collect();
    let par: Vec<usize> = (0..88usize).map(|i| i & 1).collect();

    let comb_mod = |n: usize, k: usize| -> u64 {
        if k > n {
            return 0;
        }
        let a = mulmod(fact[n], invfact[k], MODVAL);
        mulmod(a, invfact[n - k], MODVAL)
    };

    let mut total_sum: u64 = 0;
    for ai in 0..88usize {
        let x_val = cubes[ai];
        let hx = halves[ai];
        let inv_x = invf[ai];
        let px = par[ai];
        for bj in 0..88usize {
            let y_val = cubes[bj];
            let hy = halves[bj];
            let inv_y = invf[bj];
            let py = par[bj];
            for ck in 0..88usize {
                if px != py || py != par[ck] {
                    continue;
                }
                let z_val = cubes[ck];
                let hz = halves[ck];
                let inv_z = invf[ck];
                let n = x_val + y_val + z_val;
                let mut t_val = fact[n];
                t_val = mulmod(t_val, inv_x, MODVAL);
                t_val = mulmod(t_val, inv_y, MODVAL);
                t_val = mulmod(t_val, inv_z, MODVAL);
                let d_val: u64;
                if (n & 1) == 0 && (x_val & 1) == 1 {
                    d_val = 0;
                } else {
                    let d1 = comb_mod(n >> 1, hx);
                    let n2 = n - x_val;
                    if (n2 & 1) == 0 && (y_val & 1) == 1 {
                        d_val = 0;
                    } else {
                        let d2 = comb_mod(n2 >> 1, hy);
                        d_val = mulmod(d1, d2, MODVAL);
                    }
                }
                let nmod: u64;
                if ((hx + hy + hz) & 1) == 0 {
                    nmod = mulmod((t_val + d_val) % MODVAL, inv2, MODVAL);
                } else {
                    let diff = (t_val + MODVAL - d_val) % MODVAL;
                    nmod = mulmod(diff, inv2, MODVAL);
                }
                total_sum += nmod;
                if total_sum >= MODVAL {
                    total_sum -= MODVAL;
                }
            }
        }
    }
    total_sum % MODVAL
}

fn main() {
    println!("{}", main_solve());
}
