// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/991.py

fn gcd(a: i64, b: i64) -> i64 {
    if b == 0 { a } else { gcd(b, a % b) }
}

fn isqrt(n: i64) -> i64 {
    if n < 0 { return 0; }
    let mut x = (n as f64).sqrt() as i64;
    while x * x > n { x -= 1; }
    while (x + 1) * (x + 1) <= n { x += 1; }
    x
}

fn primitive_solutions(limit: i64) -> Vec<i64> {
    let mut sums: Vec<i64> = Vec::new();

    let m_max = isqrt(limit / 4) + 2;
    for m in 1..=m_max {
        let n_min = isqrt(3 * m * m) + 1;
        let n_max = 2 * m - 1;
        for n in n_min..=n_max {
            if gcd(m, n) != 1 {
                continue;
            }
            let a = 4 * m * m - n * n;
            let c = n * n - 3 * m * m;
            let b = 5 * m * m - n * n + m * n;
            let s = a + b + c;
            if a <= 0 || b <= 0 || c <= 0 {
                continue;
            }
            if s <= limit {
                sums.push(s);
            }
        }
    }

    let alpha: f64 = 2.0 + (3.0f64).sqrt();
    let beta: f64 = (5.0 + (21.0f64).sqrt()) / 2.0;
    let mut k: i64 = 1;
    loop {
        let mut low = (alpha * k as f64) as i64 + 1;
        while (2 * low - k) * (2 * low - k) <= 3 * low * low {
            low += 1;
        }
        let mut high_pos = (beta * k as f64) as i64;
        while high_pos > 0 && !(-high_pos * high_pos + 5 * high_pos * k - k * k > 0) {
            high_pos -= 1;
        }
        let high_sum = (limit + k * k) / (5 * k);
        let high = high_pos.min(high_sum);
        if low > high_sum {
            break;
        }
        for m in low..=high {
            if gcd(m, k) != 1 {
                continue;
            }
            let n = 2 * m - k;
            let a = 4 * m * m - n * n;
            let c = n * n - 3 * m * m;
            let b = 5 * m * m - n * n - m * n;
            let s = a + b + c;
            if a <= 0 || b <= 0 || c <= 0 {
                continue;
            }
            if s <= limit {
                sums.push(s);
            }
        }
        k += 1;
    }

    sums
}

fn solve(limit: i64) -> i64 {
    let primitive = primitive_solutions(limit);
    let mut total: i64 = 0;
    for s in primitive {
        let count = limit / s;
        total += s * count * (count + 1) / 2;
    }
    total
}

fn brute_force(limit: i64) -> i64 {
    let mut total: i64 = 0;
    for a in 1..=limit {
        for b in 1..=(limit - a) {
            let max_c = limit - a - b;
            for c in 1..=max_c {
                let lhs_num = a * (a + c) + (b + c) * (b + c);
                let lhs_den = (b + c) * (a + c);
                if lhs_num == 4 * lhs_den {
                    total += a + b + c;
                }
            }
        }
    }
    total
}

fn run_tests() {
    let m = 4i64;
    let n = 7i64;
    assert_eq!(
        (4 * m * m - n * n, 5 * m * m - n * n - m * n, n * n - 3 * m * m),
        (15, 3, 1)
    );
    assert_eq!(
        (4 * m * m - n * n, 5 * m * m - n * n + m * n, n * n - 3 * m * m),
        (15, 59, 1)
    );
    assert_eq!(solve(18), 0);
    assert_eq!(solve(19), brute_force(19));
    assert_eq!(solve(75), brute_force(75));
    assert_eq!(solve(200), brute_force(200));
}

fn main() {
    run_tests();
    println!("{}", solve(10_000_000));
}
