// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/986.py

use std::collections::HashMap;

const LIMIT: usize = 160;
const PREDICT_START_N: usize = 33;
const SEARCH_WINDOW: i64 = 4096;

fn exception_h(c: usize) -> Option<i64> {
    match c {
        2 => Some(3),
        3 => Some(5),
        4 => Some(7),
        5 => Some(11),
        6 => Some(13),
        8 => Some(21),
        10 => Some(31),
        _ => None,
    }
}

fn extinct_for_k1(n: usize, k: i64) -> bool {
    if k == 0 {
        return true;
    }
    let size = n + 1;
    let last = size - 1;
    let mut cells: Vec<i64> = vec![0; size];
    cells[last] = k;
    let mut zero_count: i64 = last as i64;
    loop {
        for i in 0..last {
            let old = cells[i];
            let nxt = (old + cells[i + 1]) >> 1;
            cells[i] = nxt;
            if old != 0 {
                if nxt == 0 {
                    zero_count += 1;
                }
            } else if nxt != 0 {
                zero_count -= 1;
            }
        }
        let old = cells[last];
        let nxt = (old + cells[0]) >> 1;
        cells[last] = nxt;
        if old != 0 {
            if nxt == 0 {
                zero_count += 1;
            }
        } else if nxt != 0 {
            zero_count -= 1;
        }
        if zero_count == size as i64 {
            return true;
        }
        if zero_count == 0 {
            return false;
        }
    }
}

fn threshold_k1_plain(n: usize) -> i64 {
    let mut lo: i64 = 0;
    let mut hi: i64 = 1;
    while extinct_for_k1(n, hi) {
        lo = hi;
        hi *= 2;
    }
    while lo + 1 < hi {
        let mid = (lo + hi) / 2;
        if extinct_for_k1(n, mid) {
            lo = mid;
        } else {
            hi = mid;
        }
    }
    lo
}

fn predict_k1_from_previous(s: &[i64], n: usize) -> i64 {
    let a = s[n - 32];
    let b = s[n - 24];
    let c = s[n - 16];
    let d = s[n - 8];
    d + (d - c) + (d - 2 * c + b) + (d - 3 * c + 3 * b - a)
}

fn threshold_k1_with_guess(n: usize, guess: i64) -> i64 {
    let mut lo: i64 = std::cmp::max(0, guess - SEARCH_WINDOW);
    let mut hi: i64 = guess + SEARCH_WINDOW;
    while lo > 0 && !extinct_for_k1(n, lo) {
        hi = lo;
        lo /= 2;
    }
    while extinct_for_k1(n, hi) {
        lo = hi;
        hi *= 2;
    }
    while lo + 1 < hi {
        let mid = (lo + hi) / 2;
        if extinct_for_k1(n, mid) {
            lo = mid;
        } else {
            hi = mid;
        }
    }
    lo
}

fn build_s_sequence(max_n: usize) -> Vec<i64> {
    let mut s = vec![0i64; max_n + 1];
    for n in 1..=max_n {
        if n < PREDICT_START_N {
            s[n] = threshold_k1_plain(n);
        } else {
            let guess = predict_k1_from_previous(&s, n);
            s[n] = threshold_k1_with_guess(n, guess);
        }
    }
    s
}

fn h_reduced(c: usize, d: usize, s: &[i64]) -> i64 {
    if d == 1 {
        if let Some(v) = exception_h(c) {
            return v;
        }
    }
    s[d + (c - 1) / 2]
}

fn g_value(c: usize, d: usize, s: &[i64]) -> i64 {
    let g = gcd(c, d);
    let cr = c / g;
    let dr = d / g;
    let h = h_reduced(cr, dr, s);
    2 * h + 1
}

fn gcd(a: usize, b: usize) -> usize {
    if b == 0 { a } else { gcd(b, a % b) }
}

fn solve(limit: usize) -> i64 {
    let max_n = limit + (limit - 1) / 2;
    let s = build_s_sequence(max_n);
    assert_eq!(g_value(2, 1, &s), 7);
    assert_eq!(g_value(1, 2, &s), 7);
    assert_eq!(g_value(3, 1, &s), 11);
    assert_eq!(g_value(2, 2, &s), 3);
    assert_eq!(g_value(1, 3, &s), 15);
    let mut memo: HashMap<(usize, usize), i64> = HashMap::new();
    let mut total: i64 = 0;
    for c in 1..=limit {
        for d in 1..=limit {
            let g = gcd(c, d);
            let key = (c / g, d / g);
            let val = if let Some(&v) = memo.get(&key) {
                v
            } else {
                let h = h_reduced(key.0, key.1, &s);
                let v = 2 * h + 1;
                memo.insert(key, v);
                v
            };
            total += val;
        }
    }
    total
}

fn main() {
    println!("{}", solve(LIMIT));
}
