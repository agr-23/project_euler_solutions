// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/979.py

const SUBS_TABLE: &[&[i32]] = &[
    &[0, 0, 1],
    &[0, 1],
];

fn build_layers(max_layer: usize) -> (Vec<Vec<i32>>, Vec<Vec<i32>>, Vec<Vec<i32>>) {
    let mut types_list: Vec<Vec<i32>> = vec![vec![]; max_layer + 1];
    let mut parent1_list: Vec<Vec<i32>> = vec![vec![]; max_layer + 1];
    let mut parent2_list: Vec<Vec<i32>> = vec![vec![]; max_layer + 1];

    types_list[0] = vec![0];
    if max_layer == 0 {
        return (types_list, parent1_list, parent2_list);
    }

    types_list[1] = vec![0; 7];
    parent1_list[1] = vec![0; 7];
    parent2_list[1] = vec![-1; 7];

    for k in 2..=max_layer {
        let prev = types_list[k - 1].clone();
        let m = prev.len();
        let mut cur: Vec<i32> = vec![];
        let mut p1: Vec<i32> = vec![];
        let mut p2: Vec<i32> = vec![];

        for (j, &t) in prev.iter().enumerate() {
            let block = SUBS_TABLE[t as usize];
            let blen = block.len();
            for (pos, &ct) in block.iter().enumerate() {
                cur.push(ct);
                p1.push(j as i32);
                if pos == blen - 1 {
                    p2.push(((j + 1) % m) as i32);
                } else {
                    p2.push(-1);
                }
            }
        }

        types_list[k] = cur;
        parent1_list[k] = p1;
        parent2_list[k] = p2;
    }

    (types_list, parent1_list, parent2_list)
}

fn build_ball_adjacency(max_layer: usize) -> (Vec<Vec<usize>>, usize, Vec<usize>) {
    let (types_list, parent1_list, parent2_list) = build_layers(max_layer);
    let sizes: Vec<usize> = (0..=max_layer).map(|k| types_list[k].len()).collect();

    let mut offsets = vec![0usize; max_layer + 1];
    let mut total = 0usize;
    for k in 0..=max_layer {
        offsets[k] = total;
        total += sizes[k];
    }

    let mut adj: Vec<Vec<usize>> = vec![vec![]; total];

    let mut add_edge = |adj: &mut Vec<Vec<usize>>, u: usize, v: usize| {
        adj[u].push(v);
        adj[v].push(u);
    };

    let origin = offsets[0];

    for k in 1..=max_layer {
        let off = offsets[k];
        let m = sizes[k];
        for i in 0..m {
            add_edge(&mut adj, off + i, off + ((i + 1) % m));
        }
    }

    if max_layer >= 1 {
        let off1 = offsets[1];
        for i in 0..sizes[1] {
            add_edge(&mut adj, origin, off1 + i);
        }
    }

    for k in 2..=max_layer {
        let off = offsets[k];
        let poff = offsets[k - 1];
        for i in 0..sizes[k] {
            let par1 = parent1_list[k][i] as usize;
            add_edge(&mut adj, off + i, poff + par1);
            let p = parent2_list[k][i];
            if p != -1 {
                add_edge(&mut adj, off + i, poff + p as usize);
            }
        }
    }

    if max_layer >= 1 {
        for k in 0..max_layer {
            let off = offsets[k];
            for i in 0..sizes[k] {
                let u = off + i;
                assert_eq!(
                    adj[u].len(),
                    7,
                    "Assertion failed: adj degree at ({},{}) is {}",
                    k,
                    i,
                    adj[u].len()
                );
            }
        }
    }

    (adj, origin, offsets)
}

fn compute_f(n: i64) -> i64 {
    if n < 0 {
        return 0;
    }
    if n == 0 {
        return 1;
    }
    let max_layer = (n / 2) as usize;
    let (adj, origin, _) = build_ball_adjacency(max_layer);
    let node_count = adj.len();
    let mut dp: Vec<i64> = vec![0; node_count];
    dp[origin] = 1;

    for _ in 0..n {
        let mut ndp: Vec<i64> = vec![0; node_count];
        for u in 0..node_count {
            let val = dp[u];
            if val != 0 {
                for &v in &adj[u] {
                    ndp[v] += val;
                }
            }
        }
        dp = ndp;
    }

    dp[origin]
}

fn main() {
    let f4 = compute_f(4);
    assert_eq!(f4, 119, "Assertion failed: F(4) == {}, expected 119", f4);
    println!("{}", compute_f(20));
}
