// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/983.py

use std::collections::{HashMap, HashSet};

const OFF: i32 = 1 << 15;
const SHIFT: i32 = 17;

fn encode_coord(x: i32, y: i32) -> i32 {
    ((x + OFF) << SHIFT) | (y + OFF)
}

fn circle_points(m: i32) -> Vec<(i32, i32)> {
    let lim = (m as f64).sqrt() as i32;
    let mut pts = Vec::new();
    for x in -lim..=lim {
        let y2 = m - x * x;
        if y2 < 0 { continue; }
        let y = (y2 as f64).sqrt() as i32;
        if y * y == y2 {
            pts.push((x, y));
            if y != 0 { pts.push((x, -y)); }
        }
    }
    pts
}

fn compute_opposite_pairs(points: &[(i32, i32)]) -> Vec<((i32, i32), (i32, i32))> {
    let mut pairs = Vec::new();
    let mut used = HashSet::new();
    let mut sorted = points.to_vec();
    sorted.sort();
    for v in &sorted {
        let vk = encode_coord(v.0, v.1);
        if used.contains(&vk) { continue; }
        let w = (-v.0, -v.1);
        used.insert(vk);
        used.insert(encode_coord(w.0, w.1));
        pairs.push((*v, w));
    }
    pairs
}

fn count_antipodal_pairs(m: i32) -> i32 {
    let mut x = m;
    while x % 2 == 0 { x /= 2; }
    let mut product = 1i32;
    let mut p = 3i32;
    while p * p <= x {
        if x % p == 0 {
            let mut exponent = 0;
            while x % p == 0 { x /= p; exponent += 1; }
            if p % 4 == 1 {
                product *= exponent + 1;
            } else if exponent & 1 != 0 {
                return 0;
            }
        }
        p += 2;
    }
    if x > 1 {
        if x % 4 == 1 { product *= 2; }
        else if x % 4 == 3 { return 0; }
    }
    2 * product
}

fn build_displacement_set(points: &[(i32, i32)]) -> HashSet<i32> {
    let mut deltas = HashSet::new();
    for &(ax, ay) in points {
        for &(bx, by) in points {
            if ax != bx || ay != by {
                deltas.insert(encode_coord(ax - bx, ay - by));
            }
        }
    }
    deltas
}

fn check_four_vector_prune(selected: &[(i32, i32)], candidate: (i32, i32), deltas: &HashSet<i32>) -> bool {
    if selected.len() < 3 { return true; }
    let (vx, vy) = candidate;
    let sel = selected.len();
    for i in 0..sel - 2 {
        let (ax, ay) = selected[i];
        for j in i + 1..sel - 1 {
            let (bx, by) = selected[j];
            for k in j + 1..sel {
                let (cx, cy) = selected[k];
                for &sa in &[1i32, -1] {
                    let x1 = vx + sa * ax;
                    let y1 = vy + sa * ay;
                    for &sb in &[1i32, -1] {
                        let x2 = x1 + sb * bx;
                        let y2 = y1 + sb * by;
                        let xv = x2 + cx;
                        let yv = y2 + cy;
                        if (xv != 0 || yv != 0) && deltas.contains(&encode_coord(xv, yv)) { return false; }
                        let xv2 = x2 - cx;
                        let yv2 = y2 - cy;
                        if (xv2 != 0 || yv2 != 0) && deltas.contains(&encode_coord(xv2, yv2)) { return false; }
                    }
                }
            }
        }
    }
    true
}

fn build_even_masks(k: usize) -> Vec<usize> {
    let mut masks = Vec::new();
    for mask in 0..(1usize << k) {
        if mask.count_ones() % 2 == 0 { masks.push(mask); }
    }
    masks
}

fn compute_centers(vectors: &[(i32, i32)], masks: &[usize]) -> Vec<(i32, i32)> {
    let mut centers = Vec::new();
    for &mask in masks {
        let mut x = 0i32;
        let mut y = 0i32;
        let mut mm = mask;
        while mm != 0 {
            let lsb = mm & mm.wrapping_neg();
            let idx = lsb.trailing_zeros() as usize;
            x += vectors[idx].0;
            y += vectors[idx].1;
            mm -= lsb;
        }
        centers.push((x, y));
    }
    centers
}

fn quick_harmony_check(centers: &[(i32, i32)], pts: &[(i32, i32)], n: usize) -> bool {
    let mut counts: HashMap<i32, i32> = HashMap::new();
    let mut harmony_count = 0usize;
    for &(cx, cy) in centers {
        for &(vx, vy) in pts {
            let key = encode_coord(cx + vx, cy + vy);
            let cur = counts.entry(key).or_insert(0);
            if *cur == 0 { *cur = 1; }
            else if *cur == 1 { *cur = 2; harmony_count += 1; if harmony_count > n { return false; } }
            else { *cur += 1; }
        }
    }
    harmony_count == n
}

fn strict_check(centers: &[(i32, i32)], pts: &[(i32, i32)], n: usize) -> bool {
    let center_codes: Vec<i32> = centers.iter().map(|&(x, y)| encode_coord(x, y)).collect();
    let center_set: HashSet<i32> = center_codes.iter().cloned().collect();
    let tangent_diffs: Vec<i32> = pts.iter().map(|&(x, y)| encode_coord(2 * x, 2 * y)).collect();
    for &c in &center_codes {
        for &d in &tangent_diffs {
            let other = c + d;
            if center_set.contains(&other) && c < other { return false; }
        }
    }
    let mut pt_to_centers: HashMap<i32, Vec<usize>> = HashMap::new();
    for (idx, &(cx, cy)) in centers.iter().enumerate() {
        for &(vx, vy) in pts {
            let key = encode_coord(cx + vx, cy + vy);
            pt_to_centers.entry(key).or_default().push(idx);
        }
    }
    let harmony_pts: Vec<i32> = pt_to_centers.iter()
        .filter(|(_, v)| v.len() >= 2)
        .map(|(&k, _)| k)
        .collect();
    if harmony_pts.len() != n { return false; }
    let mut parent: Vec<usize> = (0..n).collect();
    let mut sz: Vec<usize> = vec![1; n];
    fn find(parent: &mut Vec<usize>, mut x: usize) -> usize {
        while parent[x] != x {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        x
    }
    fn union(parent: &mut Vec<usize>, sz: &mut Vec<usize>, a: usize, b: usize) {
        let ra = find(parent, a);
        let rb = find(parent, b);
        if ra == rb { return; }
        let (ra, rb) = if sz[ra] >= sz[rb] { (ra, rb) } else { (rb, ra) };
        parent[rb] = ra;
        sz[ra] += sz[rb];
    }
    for key in &harmony_pts {
        let lst = &pt_to_centers[key];
        let base = lst[0];
        for j in 1..lst.len() {
            let other = lst[j];
            union(&mut parent, &mut sz, base, other);
        }
    }
    let root = find(&mut parent, 0);
    for i in 1..n {
        if find(&mut parent, i) != root { return false; }
    }
    true
}

fn has_unit_coord(points: &[(i32, i32)]) -> bool {
    for &(x, y) in points {
        if x.abs() == 1 || y.abs() == 1 { return true; }
    }
    false
}

fn dfs(
    pairs: &[((i32, i32), (i32, i32))],
    pts: &[(i32, i32)],
    k: usize,
    masks: &[usize],
    n: usize,
    deltas: &HashSet<i32>,
    selected: &mut Vec<(i32, i32)>,
    start: usize,
) -> bool {
    if selected.len() == k {
        let centers = compute_centers(selected, masks);
        return quick_harmony_check(&centers, pts, n) && strict_check(&centers, pts, n);
    }
    let needed = k - selected.len();
    for pi in start..=pairs.len().saturating_sub(needed) {
        let choices: Vec<(i32, i32)> = if selected.is_empty() {
            vec![pairs[pi].0]
        } else {
            vec![pairs[pi].0, pairs[pi].1]
        };
        for &vec in &choices {
            if !check_four_vector_prune(selected, vec, deltas) { continue; }
            selected.push(vec);
            if dfs(pairs, pts, k, masks, n, deltas, selected, pi + 1) { return true; }
            selected.pop();
        }
    }
    false
}

fn check_valid_oriented_vectors(pairs: &[((i32, i32), (i32, i32))], pts: &[(i32, i32)], k: usize, masks: &[usize], n: usize) -> bool {
    let deltas = build_displacement_set(pts);
    let mut selected: Vec<(i32, i32)> = Vec::new();
    dfs(pairs, pts, k, masks, n, &deltas, &mut selected, 0)
}

fn search_min_radius_sq(k: usize, m_limit: i32, filtered: bool) -> i32 {
    let masks = build_even_masks(k);
    let n = 1usize << (k - 1);
    for m in 1..=m_limit {
        let p = count_antipodal_pairs(m);
        if p < k as i32 { continue; }
        if filtered && p != k as i32 && p != k as i32 + 2 { continue; }
        let pts = circle_points(m);
        if filtered && !has_unit_coord(&pts) { continue; }
        let pairs = compute_opposite_pairs(&pts);
        if pairs.len() != p as usize { continue; }
        if check_valid_oriented_vectors(&pairs, &pts, k, &masks, n) { return m; }
    }
    panic!("No solution found up to m={}", m_limit);
}

fn main() {
    let r1 = search_min_radius_sq(2, 20, false);
    assert_eq!(r1, 1, "Expected 1, got {}", r1);
    let r2 = search_min_radius_sq(3, 50, false);
    assert_eq!(r2, 5, "Expected 5, got {}", r2);
    println!("{}", search_min_radius_sq(10, 20000, true));
}
