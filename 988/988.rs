// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/988.py

use std::collections::HashMap;

fn frog_sum(mut a: i64, mut b: i64) -> i64 {
    if a <= 0 || b <= 0 {
        panic!("a and b must be positive");
    }
    if a > b {
        std::mem::swap(&mut a, &mut b);
    }
    if a == 1 {
        return 0;
    }
    let width = b - 1;
    let mut h = vec![0i64; (width + 1) as usize];
    for i in 1..=(width as usize) {
        h[i] = (a * b - a * i as i64 - 1) / b;
    }
    let mut dp: HashMap<i64, (i64, i64)> = HashMap::new();
    for t in 0..=(h[1]) {
        dp.insert(t, (1, 0));
    }
    for i in 2..=(width as usize) {
        let mut next_dp: HashMap<i64, (i64, i64)> = HashMap::new();
        for (&prev_height, &(count, total)) in &dp {
            let limit = prev_height.min(h[i]);
            for cur_height in 0..=(limit) {
                let mut add = 0i64;
                if prev_height > cur_height && prev_height > 0 {
                    add = a * b - a * (i as i64 - 1) - b * prev_height;
                }
                let (old_count, old_total) = next_dp.get(&cur_height).copied().unwrap_or((0, 0));
                next_dp.insert(
                    cur_height,
                    (old_count + count, old_total + total + count * add),
                );
            }
        }
        dp = next_dp;
    }
    let mut answer = 0i64;
    let last_column = width;
    for (&prev_height, &(count, total)) in &dp {
        let mut add = 0i64;
        if prev_height > 0 {
            add = a * b - a * last_column - b * prev_height;
        }
        answer += total + count * add;
    }
    answer
}

fn solve() {
    assert_eq!(frog_sum(3, 5), 23);
    assert_eq!(frog_sum(5, 13), 16336);
    println!("{}", frog_sum(19, 53));
}

fn main() {
    solve();
}
