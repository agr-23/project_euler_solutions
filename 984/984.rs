// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/984.py

const MODVAL: u64 = 1_000_000_007;
const TARGET_N: u64 = 1_000_000_000_000_000_000;

const EVEN_POLY: [(i64, u64, u32); 8] = [
    (31, 40320, 8),
    (31, 3360, 7),
    (67, 1440, 6),
    (41, 320, 5),
    (313, 1440, 4),
    (-5699, 240, 3),
    (16049, 420, 2),
    (29413, 140, 1),
];

fn modpow(mut base: u64, mut exp: u64, modulus: u64) -> u64 {
    let mut result: u64 = 1;
    base %= modulus;
    while exp > 0 {
        if exp % 2 == 1 {
            result = ((result as u128 * base as u128) % modulus as u128) as u64;
        }
        base = ((base as u128 * base as u128) % modulus as u128) as u64;
        exp /= 2;
    }
    result
}

fn compute_even_mod(n: u64, modulus: u64) -> u64 {
    let mut powers: Vec<u64> = vec![1u64];
    let x: u64 = n % modulus;
    for _ in 0..8 {
        let last = *powers.last().unwrap();
        powers.push(((last as u128 * x as u128) % modulus as u128) as u64);
    }
    let mut total: i128 = -419;
    for &(numerator, denominator, power) in &EVEN_POLY {
        let inv_den = modpow(denominator, modulus - 2, modulus) as i128;
        let term = numerator as i128 * powers[power as usize] as i128 % modulus as i128 * inv_den % modulus as i128;
        total += term;
        total = ((total % modulus as i128) + modulus as i128) % modulus as i128;
    }
    total as u64
}

fn gcd_big(a: i128, b: i128) -> i128 {
    let mut a = if a < 0 { -a } else { a };
    let mut b = if b < 0 { -b } else { b };
    while b != 0 {
        let t = b;
        b = a % b;
        a = t;
    }
    a
}

fn compute_even_int(n: i128) -> i128 {
    let mut num_total: i128 = -419;
    let mut den_total: i128 = 1;
    for &(numerator, denominator, power) in &EVEN_POLY {
        let n_pow = n.pow(power);
        let term_num: i128 = numerator as i128 * n_pow;
        let term_den: i128 = denominator as i128;
        num_total = num_total * term_den + term_num * den_total;
        den_total = den_total * term_den;
        let g = gcd_big(
            if num_total < 0 { -num_total } else { num_total },
            if den_total < 0 { -den_total } else { den_total },
        );
        num_total /= g;
        den_total /= g;
    }
    assert!(
        den_total == 1 || den_total == -1,
        "Expected integral closed-form value"
    );
    if den_total == -1 { -num_total } else { num_total }
}

fn run_solve() -> u64 {
    let check1 = compute_even_int(100);
    assert_eq!(check1, 8658918531876, "Expected 8658918531876 got {}", check1);
    let check2 = compute_even_mod(10000, MODVAL);
    assert_eq!(check2, 377956308, "Expected 377956308 got {}", check2);
    compute_even_mod(TARGET_N, MODVAL)
}

fn main() {
    println!("{}", run_solve());
}
