// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/974.py

use std::collections::HashMap;

const DIGITS_ARR: [i32; 5] = [1, 3, 5, 7, 9];
const ALL_MASK: i32 = (1 << 5) - 1;

fn bit_of(d: i32) -> i32 {
    match d {
        1 => 0,
        3 => 1,
        5 => 2,
        7 => 3,
        9 => 4,
        _ => panic!("unexpected digit"),
    }
}

fn compute_count_len(big_l: i32) -> i64 {
    let mut memo: HashMap<(i32, i32, i32, i32), i64> = HashMap::new();
    dp_count(0, 0, 0, 0, big_l, &mut memo)
}

fn dp_count(pos: i32, mod3: i32, mod7: i32, mask: i32, big_l: i32, memo: &mut HashMap<(i32, i32, i32, i32), i64>) -> i64 {
    if pos == big_l {
        return if mod3 == 0 && mod7 == 0 && mask == ALL_MASK { 1 } else { 0 };
    }
    let key = (pos, mod3, mod7, mask);
    if let Some(&cached) = memo.get(&key) {
        return cached;
    }
    let choices: &[i32] = if pos == big_l - 1 { &[5] } else { &DIGITS_ARR };
    let mut total: i64 = 0;
    for &d in choices {
        total += dp_count(pos + 1, (mod3 * 10 + d) % 3, (mod7 * 10 + d) % 7, mask ^ (1 << bit_of(d)), big_l, memo);
    }
    memo.insert(key, total);
    total
}

fn perform_unrank(big_l: i32, k_val: i64) -> String {
    let mut memo: HashMap<(i32, i32, i32, i32), i64> = HashMap::new();
    let mut mod3 = 0i32;
    let mut mod7 = 0i32;
    let mut mask = 0i32;
    let mut out = String::new();
    let mut remaining = k_val;
    for pos in 0..big_l {
        let choices: &[i32] = if pos == big_l - 1 { &[5] } else { &DIGITS_ARR };
        let mut found = false;
        for &d in choices {
            let cnt = dp_count(pos + 1, (mod3 * 10 + d) % 3, (mod7 * 10 + d) % 7, mask ^ (1 << bit_of(d)), big_l, &mut memo);
            if remaining > cnt {
                remaining -= cnt;
            } else {
                out.push_str(&d.to_string());
                mod3 = (mod3 * 10 + d) % 3;
                mod7 = (mod7 * 10 + d) % 7;
                mask ^= 1 << bit_of(d);
                found = true;
                break;
            }
        }
        if !found {
            panic!("RuntimeError");
        }
    }
    out
}

fn compute_theta(n: i64, max_l: i32) -> String {
    let mut cum: i64 = 0;
    let mut l = 1i32;
    while l <= max_l {
        let c = compute_count_len(l);
        if cum + c >= n {
            return perform_unrank(l, n - cum);
        }
        cum += c;
        l += 2;
    }
    panic!("ValueError");
}

fn main() {
    let r1 = compute_theta(1, 40);
    assert_eq!(r1, "1117935", "assert failed: {}", r1);
    let r2 = compute_theta(1000, 40);
    assert_eq!(r2, "11137955115", "assert failed: {}", r2);
    println!("{}", compute_theta(10_000_000_000_000_000, 200));
}
