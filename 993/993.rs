// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/993.py

use std::collections::HashSet;

const PERIOD_START: i64 = 514;
const PERIOD: i64 = 71;
const DELTA_PATTERN: [i64; 71] = [
    17, -2, -8, -2, -2, -14, -2, -2, -17, -8, -5, -8, -5, -2, -2, -5, -8, 50, -8, 23, -13, -2,
    67, -5, -2, -2, -5, -8, -5, 21, 29, -11, -2, -2, 6, -11, 31, -2, -11, 17, -2, -8, -2, -2,
    -14, -2, -2, -17, -8, -5, -8, -8, 8, -13, -5, -2, -2, -5, -2, -11, -8, -8, -5, -2, -11, -8,
    -8, -5, -2, -11, 216,
];

fn pattern_sum() -> i64 {
    DELTA_PATTERN.iter().sum()
}

fn step_state(
    pos: i64,
    carry: i64,
    bananas: &HashSet<i64>,
) -> Option<(i64, i64, HashSet<i64>)> {
    let has_x = bananas.contains(&pos);
    let has_x1 = bananas.contains(&(pos + 1));
    if has_x && has_x1 {
        let mut new_bananas = bananas.clone();
        new_bananas.remove(&(pos + 1));
        return Some((pos - 1, carry + 1, new_bananas));
    }
    if has_x && !has_x1 {
        let mut new_bananas = bananas.clone();
        new_bananas.remove(&pos);
        return Some((pos + 2, carry + 1, new_bananas));
    }
    if !has_x && has_x1 {
        let mut new_bananas = bananas.clone();
        new_bananas.remove(&(pos + 1));
        new_bananas.insert(pos);
        return Some((pos + 2, carry, new_bananas));
    }
    if carry >= 3 {
        let mut new_bananas = bananas.clone();
        new_bananas.insert(pos - 1);
        new_bananas.insert(pos);
        new_bananas.insert(pos + 1);
        return Some((pos - 2, carry - 3, new_bananas));
    }
    None
}

fn simulate_steps(initial_bananas: i64, steps: usize) -> (i64, i64, HashSet<i64>) {
    let mut pos: i64 = 0;
    let mut carry = initial_bananas;
    let mut bananas: HashSet<i64> = HashSet::new();
    for _ in 0..steps {
        match step_state(pos, carry, &bananas) {
            None => break,
            Some((np, nc, nb)) => {
                pos = np;
                carry = nc;
                bananas = nb;
            }
        }
    }
    (pos, carry, bananas)
}

fn simulate_bb_values(limit: usize) -> Vec<i64> {
    let mut bb = vec![0i64];
    let mut pos: i64 = 0;
    let mut carry: i64 = 0;
    let mut bananas: HashSet<i64> = HashSet::new();
    for _ in 1..=(limit as i64) {
        carry += 1;
        loop {
            match step_state(pos, carry, &bananas) {
                None => {
                    bb.push(pos);
                    break;
                }
                Some((np, nc, nb)) => {
                    pos = np;
                    carry = nc;
                    bananas = nb;
                }
            }
        }
    }
    bb
}

fn build_prefix() -> Vec<i64> {
    simulate_bb_values((PERIOD_START + PERIOD) as usize)
}

fn bb_func(n: i64, bb_prefix: &[i64]) -> i64 {
    if n <= PERIOD_START {
        return bb_prefix[n as usize];
    }
    let remaining = n - PERIOD_START;
    let whole_periods = remaining / PERIOD;
    let tail = (remaining % PERIOD) as usize;
    bb_prefix[PERIOD_START as usize]
        + whole_periods * pattern_sum()
        + DELTA_PATTERN[..tail].iter().sum::<i64>()
}

fn main() {
    let bb_prefix = build_prefix();

    let (pos, carry, bananas) = simulate_steps(3, 1);
    assert_eq!(pos, -2);
    assert_eq!(carry, 0);
    let expected1: HashSet<i64> = [-1, 0, 1].iter().cloned().collect();
    assert_eq!(bananas, expected1);

    let (pos2, carry2, bananas2) = simulate_steps(5, 5);
    assert_eq!(pos2, -1);
    assert_eq!(carry2, 0);
    let expected2: HashSet<i64> = [-2, -1, 0, 1, 2].iter().cloned().collect();
    assert_eq!(bananas2, expected2);

    assert_eq!(bb_func(1000, &bb_prefix), 1499);

    let deltas: Vec<i64> = (0..bb_prefix.len() - 1)
        .map(|i| bb_prefix[i + 1] - bb_prefix[i])
        .collect();
    for (i, &delta) in DELTA_PATTERN.iter().enumerate() {
        assert_eq!(deltas[PERIOD_START as usize + i], delta);
    }

    println!("{}", bb_func(1_000_000_000_000_000_000i64, &bb_prefix));
}
