// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/998.py

use std::collections::HashSet;

fn gcd(mut a: i64, mut b: i64) -> i64 {
    while b != 0 {
        let t = b;
        b = a % b;
        a = t;
    }
    a
}

fn isqrt(n: i64) -> i64 {
    if n < 0 {
        panic!("isqrt of negative");
    }
    if n == 0 {
        return 0;
    }
    let mut x = (n as f64).sqrt() as i64;
    while x * x > n {
        x -= 1;
    }
    while (x + 1) * (x + 1) <= n {
        x += 1;
    }
    x
}

fn pythagorean_partners(limit: i64) -> Vec<Vec<i64>> {
    let mut partners: Vec<Vec<i64>> = vec![vec![]; (limit + 1) as usize];
    let r_max = isqrt(2 * limit) + 3;
    for r in 2..=r_max {
        let rr = r * r;
        for s in 1..r {
            if ((r - s) & 1) == 0 || gcd(r, s) != 1 {
                continue;
            }
            let a = rr - s * s;
            let b = 2 * r * s;
            let m = if a > b { a } else { b };
            let x = if a > b { b } else { a };
            if m > limit {
                continue;
            }
            let mut km = m;
            while km <= limit {
                partners[km as usize].push((km / m) * x);
                km += m;
            }
        }
    }
    for row in partners.iter_mut() {
        row.sort();
    }
    partners
}

fn is_minimum_square(sides: &[i64; 3], twice_area: i64, square_side: i64) -> bool {
    let ss = sides;
    let m = square_side;
    let m2 = m * m;
    let d_area = twice_area;
    let mut has_equal_candidate = false;

    for i in 0..3 {
        let d = ss[i];
        let e = ss[(i + 1) % 3];
        let f = ss[(i + 2) % 3];
        let den = 2 * d;
        let t_num = d * d + e * e - f * f;
        let d_num = d * den;
        let span_max = *[0i64, d_num, t_num].iter().max().unwrap();
        let span_min = *[0i64, d_num, t_num].iter().min().unwrap();
        let width_num = span_max - span_min;
        let width_cmp = width_num - m * den;
        let height_cmp = d_area - m * d;
        if width_cmp < 0 && height_cmp < 0 {
            return false;
        }
        if width_cmp <= 0 && height_cmp <= 0 && (width_cmp == 0 || height_cmp == 0) {
            has_equal_candidate = true;
        }
    }

    for i in 0..3 {
        let r = ss[i];
        let p = ss[(i + 1) % 3];
        let q = ss[(i + 2) % 3];
        let k_num = p * p + q * q - r * r;
        if k_num <= 0 {
            continue;
        }
        let r_den_part = p * p + q * q - 2 * d_area;
        if r_den_part <= 0 {
            continue;
        }
        let num = k_num * k_num;
        let den = 4 * r_den_part;
        let p2 = p * p;
        let q2 = q * q;
        if num < d_area * den {
            continue;
        }
        if num > p2 * den || num > q2 * den {
            continue;
        }
        if p2 * den > 2 * num || q2 * den > 2 * num {
            continue;
        }
        let target = m2 * den;
        if num < target {
            return false;
        }
        if num == target {
            has_equal_candidate = true;
        }
    }

    has_equal_candidate
}

fn solve(limit: i64) -> i64 {
    let partners = pythagorean_partners(limit);
    let mut seen: HashSet<[i64; 3]> = HashSet::new();
    let mut total: i64 = 0;

    for m in 1..=limit {
        let mm = m * m;
        let mut row: Vec<(i64, i64)> = vec![(0, m)];
        for &x in &partners[m as usize] {
            row.push((x, isqrt(mm + x * x)));
        }
        let row_len = row.len();

        for i in 0..row_len {
            let (x, hx) = row[i];
            for j in i..row_len {
                let (y, hy) = row[j];
                let base = x + y;
                if base == 0 {
                    continue;
                }
                if base > m {
                    break;
                }
                if x * y < m * (m - base) {
                    continue;
                }
                let mut arr = [base, hx, hy];
                arr.sort();
                if !seen.contains(&arr) {
                    seen.insert(arr);
                    total += arr[0] + arr[1] + arr[2];
                }
            }
        }

        for i in 0..row_len {
            let (u, hu) = row[i];
            for j in i..row_len {
                let (v, hv) = row[j];
                let twice_area = mm - u * v;
                if twice_area <= 0 {
                    continue;
                }
                let p = m - u;
                let q = m - v;
                let third2 = p * p + q * q;
                let third = isqrt(third2);
                if third * third != third2 || third == 0 {
                    continue;
                }
                let mut arr = [third, hu, hv];
                arr.sort();
                if seen.contains(&arr) {
                    continue;
                }
                if is_minimum_square(&arr, twice_area, m) {
                    seen.insert(arr);
                    total += arr[0] + arr[1] + arr[2];
                }
            }
        }
    }

    total
}

fn main() {
    assert_eq!(solve(40), 346);
    assert_eq!(solve(400), 76402);
    assert_eq!(solve(2000), 3237036);
    println!("{}", solve(1_000_000));
}