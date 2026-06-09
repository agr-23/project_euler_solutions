// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/989.py

use std::collections::HashMap;

const MOD: u64 = 1_000_000_009;
const TARGET_LIMIT: u64 = 100_000_000_000_000;
const SMALL_NONPRIMITIVE_LIMIT: usize = 8;

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

fn tonelli_shanks(n: u64, p: u64) -> u64 {
    if n == 0 {
        return 0;
    }
    if mod_pow(n, (p - 1) / 2, p) != 1 {
        panic!("not a quadratic residue");
    }
    if p % 4 == 3 {
        return mod_pow(n, (p + 1) / 4, p);
    }
    let mut q = p - 1;
    let mut s = 0u64;
    while q % 2 == 0 {
        q /= 2;
        s += 1;
    }
    let mut z = 2u64;
    while mod_pow(z, (p - 1) / 2, p) != p - 1 {
        z += 1;
    }
    let mut m = s;
    let mut c = mod_pow(z, q, p);
    let mut t = mod_pow(n, q, p);
    let mut r = mod_pow(n, (q + 1) / 2, p);
    while t != 1 {
        let mut i = 1u64;
        let mut t2i = t * t % p;
        while t2i != 1 {
            t2i = t2i * t2i % p;
            i += 1;
        }
        let b = mod_pow(c, 1 << (m - i - 1), p);
        r = r * b % p;
        c = b * b % p;
        t = t * c % p;
        m = i;
    }
    r
}

fn isqrt(n: u64) -> u64 {
    if n == 0 {
        return 0;
    }
    let mut x = (n as f64).sqrt() as u64;
    while x * x > n {
        x -= 1;
    }
    while (x + 1) * (x + 1) <= n {
        x += 1;
    }
    x
}

fn gcd(a: u64, b: u64) -> u64 {
    if b == 0 { a } else { gcd(b, a % b) }
}

fn build_small_nonprimitive_terms(max_limit: usize) -> Vec<Vec<u64>> {
    let mut values: Vec<u64> = Vec::new();
    let max_a = 2 * isqrt(max_limit as u64) + 2;
    for a in 2..=max_a {
        for b in 1..=(a / 2) {
            let q = a * a - a * b;
            if b * b < q && q - b * b <= max_limit as u64 {
                values.push(q - b * b);
            } else if a * a >= a * b + b * b {
                let q2 = a * a - a * b - b * b;
                if q2 > 0 && q2 <= max_limit as u64 {
                    values.push(q2);
                }
            }
        }
    }
    // redo correctly matching Python
    values.clear();
    let max_a2 = 2 * isqrt(max_limit as u64) + 2;
    for a in 2..=max_a2 {
        for b in 1..=(a / 2) {
            let a_i = a as i64;
            let b_i = b as i64;
            let q = a_i * a_i - a_i * b_i - b_i * b_i;
            if q > 0 && q <= max_limit as i64 {
                values.push(q as u64);
            }
        }
    }
    values.sort();
    let mut terms: Vec<Vec<u64>> = vec![Vec::new(); max_limit + 1];
    let mut prefix: Vec<u64> = Vec::new();
    let mut index = 0usize;
    let total = values.len();
    for limit in 0..=max_limit {
        while index < total && values[index] <= limit as u64 {
            prefix.push(values[index]);
            index += 1;
        }
        terms[limit] = prefix.clone();
    }
    terms
}

fn eval_small_nonprimitive_pair(limit: usize, z1: u64, z2: u64, terms: &Vec<Vec<u64>>) -> (u64, u64) {
    let t = &terms[limit];
    let mut total1 = 0u64;
    let mut total2 = 0u64;
    let mut power1 = 1u64;
    let mut power2 = 1u64;
    let mut exponent = 0u64;
    for &target in t {
        while exponent < target {
            power1 = power1 * z1 % MOD;
            power2 = power2 * z2 % MOD;
            exponent += 1;
        }
        total1 += power1;
        if total1 >= MOD { total1 -= MOD; }
        total2 += power2;
        if total2 >= MOD { total2 -= MOD; }
    }
    (total1, total2)
}

fn mobius_sieve(limit: usize) -> Vec<i8> {
    let mut mu = vec![1i8; limit + 1];
    let mut is_prime = vec![true; limit + 1];
    if limit >= 1 { is_prime[0] = false; }
    if limit >= 1 { is_prime[1] = false; }
    for p in 2..=limit {
        if !is_prime[p] { continue; }
        let mut multiple = p;
        while multiple <= limit {
            mu[multiple] = -mu[multiple];
            multiple += p;
        }
        let square = p * p;
        if square <= limit {
            let mut multiple2 = square;
            while multiple2 <= limit {
                mu[multiple2] = 0;
                multiple2 += square;
            }
            let mut multiple3 = square;
            while multiple3 <= limit {
                is_prime[multiple3] = false;
                multiple3 += p;
            }
        }
        let mut multiple4 = p + p;
        while multiple4 <= limit {
            is_prime[multiple4] = false;
            multiple4 += p;
        }
    }
    mu
}

fn nonprimitive_pair(
    limit: u64,
    z1: u64,
    z1_inv: u64,
    z2: u64,
    z2_inv: u64,
    small_terms: &Vec<Vec<u64>>,
) -> (u64, u64) {
    if limit <= SMALL_NONPRIMITIVE_LIMIT as u64 {
        return eval_small_nonprimitive_pair(limit as usize, z1, z2, small_terms);
    }
    let modv = MOD;
    let mut total1 = 0u64;
    let mut total2 = 0u64;
    let z1_sq = z1 * z1 % modv;
    let z2_sq = z2 * z2 % modv;
    let z1_inv_sq = z1_inv * z1_inv % modv;
    let z2_inv_sq = z2_inv * z2_inv % modv;
    let z1_inv_4 = z1_inv_sq * z1_inv_sq % modv;
    let z2_inv_4 = z2_inv_sq * z2_inv_sq % modv;
    let z1_inv_5 = z1_inv_4 * z1_inv % modv;
    let z2_inv_5 = z2_inv_4 * z2_inv % modv;
    let z1_inv_10 = z1_inv_5 * z1_inv_5 % modv;
    let z2_inv_10 = z2_inv_5 * z2_inv_5 % modv;
    let z1_inv_15 = z1_inv_10 * z1_inv_5 % modv;
    let z2_inv_15 = z2_inv_10 * z2_inv_5 % modv;

    let mut even_weight1 = z1_inv_5;
    let mut even_weight2 = z2_inv_5;
    let mut even_delta1 = z1_inv_15;
    let mut even_delta2 = z2_inv_15;
    let mut add_index: i64 = 0;
    let mut add_term1 = 1u64;
    let mut add_term2 = 1u64;
    let mut add_step1 = z1;
    let mut add_step2 = z2;
    let mut drop_index: i64 = 0;
    let mut drop_term1 = 1u64;
    let mut drop_term2 = 1u64;
    let mut drop_step1 = z1;
    let mut drop_step2 = z2;
    let mut window1 = 0u64;
    let mut window2 = 0u64;
    let mut t: i64 = 1;
    let mut lower: i64 = 3;
    let mut upper: i64 = 0;
    let mut rhs: i64 = limit as i64 + 5;
    while (upper + 1) * (upper + 1) <= rhs {
        upper += 1;
    }
    while lower <= upper {
        while add_index <= upper {
            window1 += add_term1;
            if window1 >= modv { window1 -= modv; }
            window2 += add_term2;
            if window2 >= modv { window2 -= modv; }
            add_term1 = add_term1 * add_step1 % modv;
            add_step1 = add_step1 * z1_sq % modv;
            add_term2 = add_term2 * add_step2 % modv;
            add_step2 = add_step2 * z2_sq % modv;
            add_index += 1;
        }
        while drop_index < lower {
            if window1 < drop_term1 { window1 += modv; }
            window1 -= drop_term1;
            if window2 < drop_term2 { window2 += modv; }
            window2 -= drop_term2;
            drop_term1 = drop_term1 * drop_step1 % modv;
            drop_step1 = drop_step1 * z1_sq % modv;
            drop_term2 = drop_term2 * drop_step2 % modv;
            drop_step2 = drop_step2 * z2_sq % modv;
            drop_index += 1;
        }
        total1 = (total1 + window1 * even_weight1) % modv;
        total2 = (total2 + window2 * even_weight2) % modv;
        even_weight1 = even_weight1 * even_delta1 % modv;
        even_delta1 = even_delta1 * z1_inv_10 % modv;
        even_weight2 = even_weight2 * even_delta2 % modv;
        even_delta2 = even_delta2 * z2_inv_10 % modv;
        rhs += 10 * t + 5;
        t += 1;
        lower += 3;
        while (upper + 1) * (upper + 1) <= rhs {
            upper += 1;
        }
    }

    let mut odd_weight1 = z1_inv;
    let mut odd_weight2 = z2_inv;
    let mut odd_delta1 = z1_inv_10;
    let mut odd_delta2 = z2_inv_10;
    add_index = 0;
    add_term1 = 1;
    add_term2 = 1;
    add_step1 = z1_sq;
    add_step2 = z2_sq;
    drop_index = 0;
    drop_term1 = 1;
    drop_term2 = 1;
    drop_step1 = z1_sq;
    drop_step2 = z2_sq;
    window1 = 0;
    window2 = 0;
    t = 0;
    lower = 1;
    upper = 0;
    rhs = limit as i64 + 1;
    while (upper + 1) * (upper + 2) <= rhs {
        upper += 1;
    }
    while lower <= upper {
        while add_index <= upper {
            window1 += add_term1;
            if window1 >= modv { window1 -= modv; }
            window2 += add_term2;
            if window2 >= modv { window2 -= modv; }
            add_term1 = add_term1 * add_step1 % modv;
            add_step1 = add_step1 * z1_sq % modv;
            add_term2 = add_term2 * add_step2 % modv;
            add_step2 = add_step2 * z2_sq % modv;
            add_index += 1;
        }
        while drop_index < lower {
            if window1 < drop_term1 { window1 += modv; }
            window1 -= drop_term1;
            if window2 < drop_term2 { window2 += modv; }
            window2 -= drop_term2;
            drop_term1 = drop_term1 * drop_step1 % modv;
            drop_step1 = drop_step1 * z1_sq % modv;
            drop_term2 = drop_term2 * drop_step2 % modv;
            drop_step2 = drop_step2 * z2_sq % modv;
            drop_index += 1;
        }
        total1 = (total1 + window1 * odd_weight1) % modv;
        total2 = (total2 + window2 * odd_weight2) % modv;
        odd_weight1 = odd_weight1 * odd_delta1 % modv;
        odd_delta1 = odd_delta1 * z1_inv_10 % modv;
        odd_weight2 = odd_weight2 * odd_delta2 % modv;
        odd_delta2 = odd_delta2 * z2_inv_10 % modv;
        rhs += 10 * t + 10;
        t += 1;
        lower += 3;
        while (upper + 1) * (upper + 2) <= rhs {
            upper += 1;
        }
    }
    (total1, total2)
}

struct Constants {
    sqrt5_mod: u64,
    inv_sqrt5_mod: u64,
    inv2_mod: u64,
    phi_mod: u64,
    phi_inv_mod: u64,
    psi_mod: u64,
    phi_squared_mod: u64,
    phi_inv_squared_mod: u64,
}

fn make_constants() -> Constants {
    let sqrt5_mod = tonelli_shanks(5, MOD);
    let inv_sqrt5_mod = mod_pow(sqrt5_mod, MOD - 2, MOD);
    let inv2_mod = (MOD + 1) / 2;
    let phi_mod = (1 + sqrt5_mod) * inv2_mod % MOD;
    let phi_inv_mod = mod_pow(phi_mod, MOD - 2, MOD);
    let psi_mod = (1 + MOD - sqrt5_mod) * inv2_mod % MOD;
    let phi_squared_mod = phi_mod * phi_mod % MOD;
    let phi_inv_squared_mod = phi_inv_mod * phi_inv_mod % MOD;
    Constants {
        sqrt5_mod,
        inv_sqrt5_mod,
        inv2_mod,
        phi_mod,
        phi_inv_mod,
        psi_mod,
        phi_squared_mod,
        phi_inv_squared_mod,
    }
}

fn solve(limit: u64, c: &Constants, small_terms: &Vec<Vec<u64>>) -> u64 {
    let root = isqrt(limit);
    let mu = mobius_sieve(root as usize);
    let mut p_phi = 0u64;
    let mut p_psi = 0u64;
    let mut phi_pow_g2 = 1u64;
    let mut phi_inv_pow_g2 = 1u64;
    let mut forward_step = c.phi_mod;
    let mut backward_step = c.phi_inv_mod;
    let mut g_square: u64 = 1;
    for g in 1..=root {
        phi_pow_g2 = phi_pow_g2 * forward_step % MOD;
        forward_step = forward_step * c.phi_squared_mod % MOD;
        phi_inv_pow_g2 = phi_inv_pow_g2 * backward_step % MOD;
        backward_step = backward_step * c.phi_inv_squared_mod % MOD;
        let mu_g = mu[g as usize];
        if mu_g != 0 {
            let scaled_limit = limit / g_square;
            let (psi_pow_g2, psi_inv_pow_g2) = if g & 1 == 1 {
                (MOD - phi_inv_pow_g2, MOD - phi_pow_g2)
            } else {
                (phi_inv_pow_g2, phi_pow_g2)
            };
            let (nonprimitive_phi, nonprimitive_psi) = nonprimitive_pair(
                scaled_limit,
                phi_pow_g2,
                phi_inv_pow_g2,
                psi_pow_g2,
                psi_inv_pow_g2,
                small_terms,
            );
            if mu_g == 1 {
                p_phi += nonprimitive_phi;
                if p_phi >= MOD { p_phi -= MOD; }
                p_psi += nonprimitive_psi;
                if p_psi >= MOD { p_psi -= MOD; }
            } else {
                if p_phi < nonprimitive_phi { p_phi += MOD; }
                p_phi -= nonprimitive_phi;
                if p_psi < nonprimitive_psi { p_psi += MOD; }
                p_psi -= nonprimitive_psi;
            }
        }
        g_square += 2 * g + 1;
    }
    let diff = if p_phi >= p_psi { p_phi - p_psi } else { p_phi + MOD - p_psi };
    diff * c.inv_sqrt5_mod % MOD
}

fn brute_g(n: u64) -> u64 {
    let mut count = 0u64;
    for x in 0..n {
        if (x * x + MOD - x + MOD - 1) % n == 0 || {
            let val = x * x;
            let sub = x + 1;
            if val >= sub { (val - sub) % n == 0 } else { false }
        } {
            // recompute cleanly
        }
        let lhs = (x * x) % n;
        let rhs = (x + 1) % n;
        if lhs == rhs {
            count += 1;
        }
    }
    count
}

fn brute_g_correct(n: u64) -> u64 {
    let mut count = 0u64;
    for x in 0..n {
        let xx = (x as i64) * (x as i64) - (x as i64) - 1;
        if xx.rem_euclid(n as i64) == 0 {
            count += 1;
        }
    }
    count
}

fn factorize_small(mut n: u64) -> Vec<(u64, u32)> {
    let mut factors = Vec::new();
    let mut d = 2u64;
    while d * d <= n {
        if n % d == 0 {
            let mut exponent = 0u32;
            while n % d == 0 {
                n /= d;
                exponent += 1;
            }
            factors.push((d, exponent));
        }
        d += if d == 2 { 1 } else { 2 };
    }
    if n > 1 {
        factors.push((n, 1));
    }
    factors
}

fn g_from_factorization(n: u64) -> u64 {
    if n == 1 {
        return 1;
    }
    let mut split_prime_count = 0u32;
    for (prime, exponent) in factorize_small(n) {
        if prime == 2 {
            return 0;
        }
        if prime == 5 {
            if exponent >= 2 {
                return 0;
            }
            continue;
        }
        let residue = prime % 5;
        if residue == 2 || residue == 3 {
            return 0;
        }
        split_prime_count += 1;
    }
    1u64 << split_prime_count
}

fn reduced_pair_count(n: u64) -> u64 {
    let mut count = 0u64;
    let max_a = 2 * isqrt(n) + 2;
    for a in 2..=max_a {
        for b in 1..=(a / 2) {
            if gcd(a, b) != 1 {
                continue;
            }
            let ai = a as i64;
            let bi = b as i64;
            if ai * ai - ai * bi - bi * bi == n as i64 {
                count += 1;
            }
        }
    }
    count
}

fn brute_nonprimitive_pair(limit: u64, z1: u64, z2: u64) -> (u64, u64) {
    let mut total1 = 0u64;
    let mut total2 = 0u64;
    let max_a = 2 * isqrt(limit) + 2;
    for a in 2..=max_a {
        for b in 1..=(a / 2) {
            let ai = a as i64;
            let bi = b as i64;
            let q = ai * ai - ai * bi - bi * bi;
            if q > 0 && q <= limit as i64 {
                total1 = (total1 + mod_pow(z1, q as u64, MOD)) % MOD;
                total2 = (total2 + mod_pow(z2, q as u64, MOD)) % MOD;
            }
        }
    }
    (total1, total2)
}

fn brute_fibonacci_sum(limit: u64) -> u64 {
    let n = limit as usize;
    let mut fib = vec![0u64; n + 1];
    if n >= 1 { fib[1] = 1; }
    if n >= 2 { fib[2] = 1; }
    for i in 3..=n {
        fib[i] = (fib[i - 1] + fib[i - 2]) % MOD;
    }
    let mut total = 0u64;
    for i in 1..=n {
        total = (total + fib[i] * brute_g_correct(i as u64)) % MOD;
    }
    total
}

fn validate(c: &Constants, small_terms: &Vec<Vec<u64>>) {
    assert_eq!(c.psi_mod, (MOD - c.phi_inv_mod) % MOD);
    for n in 1u64..200 {
        let brute = brute_g_correct(n);
        let factorized = g_from_factorization(n);
        let reduced = reduced_pair_count(n);
        assert_eq!(brute, factorized, "n={}", n);
        assert_eq!(brute, reduced, "n={}", n);
    }
    for limit in 0..=SMALL_NONPRIMITIVE_LIMIT {
        let fast_pair = eval_small_nonprimitive_pair(limit, 2, 3, small_terms);
        let brute_pair = brute_nonprimitive_pair(limit as u64, 2, 3);
        assert_eq!(fast_pair, brute_pair, "limit={}", limit);
    }
    for &limit in &[1u64, 2, 5, 10, 30, 100] {
        let computed = solve(limit, c, small_terms);
        let brute = brute_fibonacci_sum(limit);
        assert_eq!(computed, brute, "limit={}", limit);
    }
    assert_eq!(solve(1000, c, small_terms), 190_950_976);
}

fn main() {
    let c = make_constants();
    let small_terms = build_small_nonprimitive_terms(SMALL_NONPRIMITIVE_LIMIT);
    validate(&c, &small_terms);
    println!("{}", solve(TARGET_LIMIT, &c, &small_terms));
}
