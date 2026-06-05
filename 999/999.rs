// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/999.py

const MOD: u64 = 1_234_567_891;
const INV_TWO: u64 = (MOD + 1) / 2;

const SMALL_W: [i64; 9] = [0, 1, 2, -4, -32, -192, 3584, 77824, 262144];

fn small_w(index: i64) -> u64 {
    if index < 0 {
        let pos = small_w(-index);
        return (MOD - pos % MOD) % MOD;
    }
    let v = SMALL_W[index as usize];
    if v < 0 {
        ((v % MOD as i64 + MOD as i64) as u64) % MOD
    } else {
        (v as u64) % MOD
    }
}

fn pow_mod(mut base: u64, mut exp: u64, modulus: u64) -> u64 {
    let mut result = 1u64;
    base %= modulus;
    while exp > 0 {
        if exp % 2 == 1 {
            result = result * base % modulus;
        }
        exp /= 2;
        base = base * base % modulus;
    }
    result
}

fn eds_block(n: i64) -> [u64; 8] {
    if n <= 4 {
        let mut result = [0u64; 8];
        for i in 0..8 {
            result[i] = small_w(n - 3 + i as i64);
        }
        return result;
    }

    let middle = n / 2;
    let source = eds_block(middle);
    let source_start = middle - 3;

    let get = |index: i64| -> u64 {
        source[(index - source_start) as usize]
    };

    let odd = |index: i64| -> u64 {
        let a = get(index + 1);
        let b = pow_mod(get(index - 1), 3, MOD);
        let c = get(index - 2);
        let d = pow_mod(get(index), 3, MOD);
        (a * b % MOD + MOD - c * d % MOD) % MOD
    };

    let even = |index: i64| -> u64 {
        let a = get(index);
        let b = get(index + 2);
        let c = pow_mod(get(index - 1), 2, MOD);
        let d = get(index - 2);
        let e = pow_mod(get(index + 1), 2, MOD);
        let inner = (b * c % MOD + MOD - d * e % MOD) % MOD;
        a * INV_TWO % MOD * inner % MOD
    };

    if n % 2 == 0 {
        [
            odd(middle - 1),
            even(middle - 1),
            odd(middle),
            even(middle),
            odd(middle + 1),
            even(middle + 1),
            odd(middle + 2),
            even(middle + 2),
        ]
    } else {
        [
            even(middle - 1),
            odd(middle),
            even(middle),
            odd(middle + 1),
            even(middle + 1),
            odd(middle + 2),
            even(middle + 2),
            odd(middle + 3),
        ]
    }
}

fn w_mod(n: i64) -> u64 {
    if n < 0 {
        let pos = w_mod(-n);
        return (MOD - pos % MOD) % MOD;
    }
    eds_block(n)[3]
}

fn a_mod(n: i64) -> u64 {
    assert!(n >= 1);
    let sign_positive = n % 4 == 1 || n % 4 == 2;
    let exp = (n as u64) * (n as u64) / 4;
    let inverse_scale = pow_mod(INV_TWO, exp, MOD);
    let wval = w_mod(n);
    if sign_positive {
        wval * inverse_scale % MOD
    } else {
        (MOD - wval * inverse_scale % MOD) % MOD
    }
}

fn main() {
    assert_eq!(a_mod(1), 1);
    assert_eq!(a_mod(2), 1);
    assert_eq!(a_mod(3), 1);
    assert_eq!(a_mod(4), 2);
    assert_eq!(a_mod(13), 23321);
    assert_eq!(a_mod(1003), 231906014);

    println!("{}", a_mod(1_000_000_000_000_000_003));
}