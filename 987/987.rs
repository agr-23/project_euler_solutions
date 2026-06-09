// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/987.py

const WINDOWS: [[usize; 5]; 10] = [
    [0, 1, 2, 3, 4],
    [1, 2, 3, 4, 5],
    [2, 3, 4, 5, 6],
    [3, 4, 5, 6, 7],
    [4, 5, 6, 7, 8],
    [5, 6, 7, 8, 9],
    [6, 7, 8, 9, 10],
    [7, 8, 9, 10, 11],
    [8, 9, 10, 11, 12],
    [9, 10, 11, 12, 0],
];

fn build_overlap() -> [[bool; 10]; 10] {
    let mut overlap = [[false; 10]; 10];
    for i in 0..10 {
        for j in 0..10 {
            let mut found = false;
            'outer: for &r in &WINDOWS[i] {
                for &s in &WINDOWS[j] {
                    if r == s {
                        found = true;
                        break 'outer;
                    }
                }
            }
            overlap[i][j] = found;
        }
    }
    overlap
}

fn build_perms() -> [[i64; 5]; 5] {
    let mut perms = [[0i64; 5]; 5];
    for n in 0..5 {
        perms[n][0] = 1;
        let mut value = 1i64;
        for k in 1..5 {
            if k <= n {
                value *= (n - (k - 1)) as i64;
                perms[n][k] = value;
            }
        }
    }
    perms
}

fn colorings_of_all_subsets(starts: &[usize], overlap: &[[bool; 10]; 10]) -> Vec<i64> {
    let k = starts.len();
    let full = 1usize << k;
    let mut adjacency = vec![0usize; k];
    for i in 0..k {
        for j in (i + 1)..k {
            if overlap[starts[i]][starts[j]] {
                adjacency[i] |= 1 << j;
                adjacency[j] |= 1 << i;
            }
        }
    }
    let mut independent = vec![false; full];
    independent[0] = true;
    for mask in 1..full {
        let bit = mask & mask.wrapping_neg();
        let vertex = bit.trailing_zeros() as usize;
        let rest = mask ^ bit;
        independent[mask] = independent[rest] && ((adjacency[vertex] & rest) == 0);
    }
    let mut dp = vec![0i64; full];
    dp[0] = 1;
    for _ in 0..4 {
        let mut new_dp = vec![0i64; full];
        for mask in 0..full {
            let mut total = 0i64;
            let mut sub = mask;
            loop {
                if independent[sub] {
                    total += dp[mask ^ sub];
                }
                if sub == 0 {
                    break;
                }
                sub = (sub - 1) & mask;
            }
            new_dp[mask] = total;
        }
        dp = new_dp;
    }
    dp
}

fn labeled_count(starts: &[usize], overlap: &[[bool; 10]; 10], perms: &[[i64; 5]; 5]) -> i64 {
    let k = starts.len();
    let full = 1usize << k;
    let colorings = colorings_of_all_subsets(starts, overlap);
    let mut total_active = [0usize; 13];
    let mut active_masks_by_rank = [0usize; 13];
    for (index, &start) in starts.iter().enumerate() {
        let bit = 1 << index;
        for &rank in &WINDOWS[start] {
            total_active[rank] += 1;
            active_masks_by_rank[rank] |= bit;
        }
    }
    let mut total = 0i64;
    for mask in 0..full {
        let mut ways = 1i64;
        for rank in 0..13 {
            let monochromatic_here = (active_masks_by_rank[rank] & mask).count_ones() as usize;
            let flexible_here = total_active[rank] - monochromatic_here;
            let ways_at_rank = perms[4 - monochromatic_here][flexible_here];
            if ways_at_rank == 0 {
                ways = 0;
                break;
            }
            ways *= ways_at_rank;
        }
        let term = colorings[mask] * ways;
        if mask.count_ones() & 1 == 1 {
            total -= term;
        } else {
            total += term;
        }
    }
    total
}

fn factorial(n: i64) -> i64 {
    if n <= 1 { 1 } else { n * factorial(n - 1) }
}

fn backtrack(
    pos: usize,
    remaining: usize,
    counts: &mut [usize; 10],
    coverage: &mut [usize; 13],
    results: &mut Vec<[usize; 10]>,
) {
    if pos == 10 {
        if remaining == 0 {
            results.push(*counts);
        }
        return;
    }
    for amount in 0..=(remaining) {
        let mut ok = true;
        for &rank in &WINDOWS[pos] {
            coverage[rank] += amount;
            if coverage[rank] > 4 {
                ok = false;
            }
        }
        counts[pos] = amount;
        if ok {
            backtrack(pos + 1, remaining - amount, counts, coverage, results);
        }
        for &rank in &WINDOWS[pos] {
            coverage[rank] -= amount;
        }
    }
    counts[pos] = 0;
}

fn feasible_type_counts(target: usize) -> Vec<[usize; 10]> {
    let mut results = Vec::new();
    let mut counts = [0usize; 10];
    let mut coverage = [0usize; 13];
    backtrack(0, target, &mut counts, &mut coverage, &mut results);
    results
}

fn count_disjoint_straights(target: usize) -> i64 {
    let overlap = build_overlap();
    let perms = build_perms();
    let mut total = 0i64;
    for type_counts in feasible_type_counts(target) {
        let mut starts = Vec::new();
        let mut divisor = 1i64;
        for (start, &amount) in type_counts.iter().enumerate() {
            for _ in 0..amount {
                starts.push(start);
            }
            divisor *= factorial(amount as i64);
        }
        total += labeled_count(&starts, &overlap, &perms) / divisor;
    }
    total
}

fn main() {
    assert_eq!(count_disjoint_straights(1), 10200);
    assert_eq!(count_disjoint_straights(2), 31832952);
    println!("{}", count_disjoint_straights(8));
}
