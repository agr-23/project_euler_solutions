// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/995.py

use std::collections::HashMap;

const LIMIT: usize = 20_000;
const PRIME_SEARCH_LIMIT: usize = 2_000_000;

fn sieve(n: usize) -> Vec<usize> {
    let mut is_prime = vec![true; n + 1];
    if n >= 1 { is_prime[0] = false; }
    if n >= 2 { is_prime[1] = false; }
    let r = (n as f64).sqrt() as usize;
    for i in 2..=r {
        if is_prime[i] {
            let start = i * i;
            let mut j = start;
            while j <= n {
                is_prime[j] = false;
                j += i;
            }
        }
    }
    (0..=n).filter(|&i| is_prime[i]).collect()
}

fn factor(n: u64, primes: &[usize]) -> Vec<(u64, u32)> {
    let mut out = Vec::new();
    let mut t = n;
    for &p in primes {
        let p = p as u64;
        if p * p > t {
            break;
        }
        if t % p == 0 {
            let mut e = 0u32;
            while t % p == 0 {
                t /= p;
                e += 1;
            }
            out.push((p, e));
        }
    }
    if t > 1 {
        out.push((t, 1));
    }
    out
}

fn divisors_from_factorization(factors: &[(u64, u32)]) -> Vec<u64> {
    let mut divs: Vec<u64> = vec![1];
    for &(p, e) in factors {
        let old = divs.clone();
        divs = Vec::new();
        let mut power: u64 = 1;
        for _ in 0..=(e as usize) {
            for &d in &old {
                divs.push(d * power);
            }
            power *= p;
        }
    }
    divs.sort();
    divs
}

fn primitive_root(p: u64, prime_factors_of_p_minus_1: &[u64]) -> u64 {
    if p == 2 {
        return 1;
    }
    let m = p - 1;
    for g in 2..p {
        let mut ok = true;
        for &q in prime_factors_of_p_minus_1 {
            if mod_pow(g, m / q, p) == 1 {
                ok = false;
                break;
            }
        }
        if ok {
            return g;
        }
    }
    panic!("primitive root not found");
}

fn mod_pow(mut base: u64, mut exp: u64, modulus: u64) -> u64 {
    let mut result = 1u64;
    base %= modulus;
    while exp > 0 {
        if exp & 1 == 1 {
            result = (result as u128 * base as u128 % modulus as u128) as u64;
        }
        exp >>= 1;
        base = (base as u128 * base as u128 % modulus as u128) as u64;
    }
    result
}

fn discrete_log_table(p: u64, root: u64) -> Vec<i64> {
    let mut table = vec![-1i64; p as usize];
    let mut x = 1u64;
    for k in 0..(p - 1) {
        table[x as usize] = k as i64;
        x = (x * root) % p;
    }
    table
}

fn gcd(a: u64, b: u64) -> u64 {
    if b == 0 { a } else { gcd(b, a % b) }
}

fn big_pow(base: u64, exp: u64) -> num_bigint::BigUint {
    use num_bigint::BigUint;
    use num_traits::One;
    let mut result = BigUint::one();
    let b = BigUint::from(base);
    for _ in 0..exp {
        result *= &b;
    }
    result
}

fn s_for_prime(
    p: usize,
    primes: &[usize],
    cache: &mut HashMap<usize, (num_bigint::BigUint, f64)>,
) -> (num_bigint::BigUint, f64) {
    use num_bigint::BigUint;
    use num_traits::One;

    if let Some(v) = cache.get(&p) {
        return v.clone();
    }
    if p == 2 {
        let res = (BigUint::one(), 0.0f64);
        cache.insert(p, res.clone());
        return res;
    }
    let pu = p as u64;
    let m = pu - 1;
    let factors = factor(m, primes);
    let divs = divisors_from_factorization(&factors);
    let prime_qs: Vec<u64> = factors.iter().map(|&(q, _)| q).collect();
    let root = primitive_root(pu, &prime_qs);
    let dlog = discrete_log_table(pu, root);

    let needed_c_count = divs.len() - 1;
    let mut least_prime_for_c: HashMap<u64, usize> = HashMap::new();
    for &q in primes {
        if q == p { continue; }
        let qu = q as u64;
        let idx = (qu % pu) as usize;
        if dlog[idx] < 0 { continue; }
        let c = gcd(dlog[idx] as u64, m);
        if c < m && !least_prime_for_c.contains_key(&c) {
            least_prime_for_c.insert(c, q);
            if least_prime_for_c.len() == needed_c_count {
                break;
            }
        }
    }
    if least_prime_for_c.len() != needed_c_count {
        panic!("increase PRIME_SEARCH_LIMIT");
    }

    let c_items: Vec<(u64, usize)> = least_prime_for_c.iter().map(|(&c, &q)| (c, q)).collect();

    let mut best_by_m: HashMap<u64, HashMap<u64, usize>> = HashMap::new();
    for &mm in &divs {
        if mm == 1 { continue; }
        let mut best: HashMap<u64, usize> = HashMap::new();
        for &(c, q) in &c_items {
            let d = gcd(c, mm);
            if d < mm {
                let entry = best.entry(d).or_insert(usize::MAX);
                if q < *entry {
                    *entry = q;
                }
            }
        }
        best_by_m.insert(mm, best);
    }

    let mut dp_value: HashMap<u64, BigUint> = HashMap::new();
    let mut dp_log: HashMap<u64, f64> = HashMap::new();
    dp_value.insert(1, BigUint::one());
    dp_log.insert(1, 0.0f64);

    for &h in &divs {
        if !dp_value.contains_key(&h) { continue; }
        let mm = m / h;
        if mm == 1 { continue; }
        let best = best_by_m[&mm].clone();
        let base_value = dp_value[&h].clone();
        let base_log = dp_log[&h];
        for &l in &divs {
            if l > 1 && mm % l == 0 {
                let next_h = h * l;
                let d_key = mm / l;
                if let Some(&q) = best.get(&d_key) {
                    let qu = q as u64;
                    let candidate = &base_value * big_pow(qu, l - 1);
                    let cand_log = base_log + (l - 1) as f64 * (qu as f64).log10();
                    if !dp_value.contains_key(&next_h) || candidate < dp_value[&next_h] {
                        dp_value.insert(next_h, candidate);
                        dp_log.insert(next_h, cand_log);
                    }
                }
            }
        }
    }

    let res = (dp_value[&m].clone(), dp_log[&m]);
    cache.insert(p, res.clone());
    res
}

fn product_t(
    limit: usize,
    primes: &[usize],
    cache: &mut HashMap<usize, (num_bigint::BigUint, f64)>,
) -> num_bigint::BigUint {
    use num_bigint::BigUint;
    use num_traits::One;
    let mut product = BigUint::one();
    for &p in primes {
        if p >= limit { break; }
        product *= s_for_prime(p, primes, cache).0;
    }
    product
}

fn scientific_from_int(n: &num_bigint::BigUint, places: usize) -> String {
    let digits = n.to_string();
    let exponent = digits.len() - 1;
    let significant = places + 1;
    let (mantissa_digits, final_exp) = if digits.len() > significant {
        let mut head: u64 = digits[..significant].parse().unwrap();
        let next_digit: u64 = digits[significant..significant + 1].parse().unwrap();
        if next_digit >= 5 {
            head += 1;
        }
        let sig_u = significant as u32;
        if head == 10u64.pow(sig_u) {
            head /= 10;
            (format!("{:0>width$}", head, width = significant), exponent + 1)
        } else {
            (format!("{:0>width$}", head, width = significant), exponent)
        }
    } else {
        let head_val: u64 = digits.parse().unwrap();
        let head = head_val * 10u64.pow((significant - digits.len()) as u32);
        (format!("{:0>width$}", head, width = significant), exponent)
    };
    let mantissa = format!("{}.{}", &mantissa_digits[..1], &mantissa_digits[1..]);
    format!("{}e{}", mantissa, final_exp)
}

fn run_tests(primes: &[usize], cache: &mut HashMap<usize, (num_bigint::BigUint, f64)>) {
    use num_bigint::BigUint;
    use std::str::FromStr;
    assert_eq!(s_for_prime(2, primes, cache).0, BigUint::from(1u64));
    assert_eq!(s_for_prime(5, primes, cache).0, BigUint::from(8u64));
    assert_eq!(
        product_t(20, primes, cache),
        BigUint::from_str("1348422598656").unwrap()
    );
    assert_eq!(
        scientific_from_int(&product_t(100, primes, cache), 5),
        "1.37451e123"
    );
}

fn main() {
    let primes = sieve(PRIME_SEARCH_LIMIT);
    let mut cache: HashMap<usize, (num_bigint::BigUint, f64)> = HashMap::new();
    run_tests(&primes, &mut cache);
    println!("{}", scientific_from_int(&product_t(LIMIT, &primes, &mut cache), 5));
}