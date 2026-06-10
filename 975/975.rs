// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/975.py

use std::collections::HashMap;
use std::f64::consts::PI;

fn primes_up_to(n: usize) -> Vec<usize> {
    let mut sieve = vec![true; n + 1];
    if n >= 1 {
        sieve[0] = false;
        sieve[1] = false;
    } else if n == 0 {
        sieve[0] = false;
    }
    let r = (n as f64).sqrt() as usize;
    for p in 2..=r {
        if sieve[p] {
            let mut j = p * p;
            while j <= n {
                sieve[j] = false;
                j += p;
            }
        }
    }
    (0..=n).filter(|&i| sieve[i]).collect()
}

fn gcd_int(mut a: i64, mut b: i64) -> i64 {
    while b != 0 {
        let t = b;
        b = a % b;
        a = t;
    }
    a
}

fn normalized_pair(num: i64, den: i64) -> (i64, i64) {
    let common = gcd_int(num.abs(), den.abs());
    (num / common, den / common)
}

fn height_val(a: i64, b: i64, point: (i64, i64)) -> f64 {
    let (num, den) = point;
    if num == 0 {
        return 0.0;
    }
    if num == den {
        return 1.0;
    }
    let x = num as f64 / den as f64;
    let z = 0.5
        - (b as f64 * (a as f64 * PI * x).cos() + a as f64 * (b as f64 * PI * x).cos())
            / (2.0 * (a + b) as f64);
    if z < 0.0 && z > -1e-14 {
        return 0.0;
    }
    if z > 1.0 && z < 1.0 + 1e-14 {
        return 1.0;
    }
    z
}

fn derivative_interval_sign(a: i64, b: i64, left: (i64, i64), right: (i64, i64)) -> i32 {
    let (left_num, left_den) = left;
    let (right_num, right_den) = right;
    let x = (left_num * right_den + right_num * left_den) as f64
        / (2.0 * left_den as f64 * right_den as f64);
    let value = ((a + b) as f64 * PI * x * 0.5).sin()
        * ((a - b).abs() as f64 * PI * x * 0.5).cos();
    if value > 0.0 {
        1
    } else {
        -1
    }
}

fn turning_values(
    a: i64,
    b: i64,
    cache: &mut HashMap<(i64, i64), Vec<f64>>,
) -> Vec<f64> {
    if let Some(v) = cache.get(&(a, b)) {
        return v.clone();
    }

    if a <= 0 || b <= 0 || (a & 1) == 0 || (b & 1) == 0 {
        panic!("a,b must be positive odd integers");
    }
    if a == b {
        panic!("a != b required");
    }
    let s = a + b;
    let delta = (a - b).abs();
    if s % 2 != 0 || delta % 2 != 0 {
        panic!("For odd a,b, a+b and |a-b| must be even");
    }

    let mut candidates: Vec<(i64, i64)> = Vec::new();
    for k in 0..=(s / 2) {
        candidates.push(normalized_pair(2 * k, s));
    }
    for k in 0..(delta / 2) {
        candidates.push(normalized_pair(2 * k + 1, delta));
    }

    let mut seen = std::collections::HashSet::new();
    let mut unique_points: Vec<(i64, i64)> = Vec::new();
    for p in &candidates {
        if seen.insert(*p) {
            unique_points.push(*p);
        }
    }
    unique_points.sort_by(|pa, pb| {
        let fa = pa.0 as f64 / pa.1 as f64;
        let fb = pb.0 as f64 / pb.1 as f64;
        fa.partial_cmp(&fb).unwrap()
    });

    let points = unique_points;
    let mut interval_signs: Vec<i32> = Vec::new();
    for idx in 0..points.len() - 1 {
        interval_signs.push(derivative_interval_sign(a, b, points[idx], points[idx + 1]));
    }

    let mut kept: Vec<(i64, i64)> = Vec::new();
    kept.push(points[0]);
    for idx in 1..points.len() - 1 {
        if interval_signs[idx - 1] != interval_signs[idx] {
            kept.push(points[idx]);
        }
    }
    kept.push(points[points.len() - 1]);

    let result: Vec<f64> = kept.iter().map(|&point| height_val(a, b, point)).collect();
    cache.insert((a, b), result.clone());
    result
}

fn compute_f(
    a: i64,
    b: i64,
    c: i64,
    d: i64,
    cache: &mut HashMap<(i64, i64), Vec<f64>>,
) -> f64 {
    let za = turning_values(a, b, cache);
    let zb = turning_values(c, d, cache);
    let mut i: i64 = 0;
    let mut j: i64 = 0;
    let mut current = 0.0f64;
    let mut total = 0.0f64;
    let mut upward = true;
    let eps = 1e-12f64;
    let max_steps = 4 * (za.len() + zb.len()) * (za.len() + zb.len());

    for _ in 0..max_steps {
        if i < 0 || i >= (za.len() as i64) - 1 || j < 0 || j >= (zb.len() as i64) - 1 {
            if (current - 1.0).abs() < 1e-9 {
                return total;
            }
            panic!("Winding walk left the valid segment range");
        }
        let a0 = za[i as usize];
        let a1 = za[(i + 1) as usize];
        let b0 = zb[j as usize];
        let b1 = zb[(j + 1) as usize];
        let lower = f64::max(f64::min(a0, a1), f64::min(b0, b1));
        let upper = f64::min(f64::max(a0, a1), f64::max(b0, b1));
        let nxt = if upward { upper } else { lower };
        total += (nxt - current).abs();
        let mut advanced = false;
        if (nxt - a0).abs() <= eps {
            i -= 1;
            advanced = true;
        } else if (nxt - a1).abs() <= eps {
            i += 1;
            advanced = true;
        }
        if (nxt - b0).abs() <= eps {
            j -= 1;
            advanced = true;
        } else if (nxt - b1).abs() <= eps {
            j += 1;
            advanced = true;
        }
        if !advanced {
            panic!("Winding walk did not hit a segment endpoint");
        }
        current = nxt;
        upward = !upward;
    }
    panic!("Exceeded maximum winding-walk steps");
}

fn compute_g(m: usize, n: usize, cache: &mut HashMap<(i64, i64), Vec<f64>>) -> f64 {
    let ps: Vec<usize> = primes_up_to(n).into_iter().filter(|&p| p >= m).collect();
    let mut total = 0.0f64;
    for i in 0..ps.len() {
        let p = ps[i] as i64;
        for k in (i + 1)..ps.len() {
            let q = ps[k] as i64;
            total += compute_f(p, q, p, 2 * q - p, cache);
        }
    }
    total
}

fn main() {
    let mut cache: HashMap<(i64, i64), Vec<f64>> = HashMap::new();
    assert!((compute_f(3, 5, 3, 7, &mut cache) - 7.01772).abs() < 1e-5);
    assert!((compute_f(7, 17, 9, 19, &mut cache) - 26.79578).abs() < 1e-5);
    assert!((compute_g(3, 20, &mut cache) - 463.80866).abs() < 1e-5);
    let ans = compute_g(500, 1000, &mut cache);
    println!("{:.5}", ans);
}
