// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/982.py

use std::collections::HashMap;

const EPS_VAL: f64 = 1e-9;

fn do_pivot(tableau: &mut Vec<Vec<f64>>, basis: &mut Vec<usize>, row: usize, col: usize) {
    let pivot_val = tableau[row][col];
    let inv = 1.0 / pivot_val;
    let n_cols = tableau[0].len();
    for j in 0..n_cols {
        tableau[row][j] *= inv;
    }
    let n_rows = tableau.len();
    for i in 0..n_rows {
        if i == row { continue; }
        let factor = tableau[i][col];
        if factor.abs() > EPS_VAL {
            for j in 0..n_cols {
                let pv = tableau[row][j];
                tableau[i][j] -= factor * pv;
            }
        }
    }
    basis[row] = col;
}

fn set_objective(tableau: &mut Vec<Vec<f64>>, basis: &[usize], c: &[f64]) {
    let m = basis.len();
    let n = tableau[0].len() - 1;
    let mut obj: Vec<f64> = (0..n).map(|j| -c[j]).collect();
    obj.push(0.0);
    for i in 0..m {
        let cb = c[basis[i]];
        if cb.abs() > EPS_VAL {
            for j in 0..=n {
                let rv = tableau[i][j];
                obj[j] += cb * rv;
            }
        }
    }
    if tableau.len() == m {
        tableau.push(obj);
    } else {
        tableau[m] = obj;
    }
}

fn simplex_max(tableau: &mut Vec<Vec<f64>>, basis: &mut Vec<usize>) -> bool {
    let m = basis.len();
    let n = tableau[0].len() - 1;
    let max_iter = 200000;
    for _ in 0..max_iter {
        let mut entering: Option<usize> = None;
        for j in 0..n {
            if tableau[m][j] < -EPS_VAL {
                entering = Some(j);
                break;
            }
        }
        let entering = match entering { None => return true, Some(e) => e };
        let mut min_ratio = f64::INFINITY;
        let mut leaving: Option<usize> = None;
        for i in 0..m {
            let a = tableau[i][entering];
            if a > EPS_VAL {
                let last = *tableau[i].last().unwrap();
                let ratio = last / a;
                if ratio < min_ratio - EPS_VAL {
                    min_ratio = ratio;
                    leaving = Some(i);
                }
            }
        }
        let leaving = match leaving { None => return false, Some(l) => l };
        do_pivot(tableau, basis, leaving, entering);
    }
    panic!("Simplex did not converge");
}

fn build_tableau(n_vars: usize, constraints: &[(Vec<f64>, String, f64)]) -> (Vec<Vec<f64>>, Vec<usize>, Vec<usize>, usize) {
    let mut rows: Vec<Vec<f64>> = Vec::new();
    let mut rhs: Vec<f64> = Vec::new();
    let mut basis: Vec<usize> = Vec::new();
    let mut art_indices: Vec<usize> = Vec::new();
    let mut n_total = n_vars;

    let mut add_var = |rows: &mut Vec<Vec<f64>>, n_total: &mut usize| {
        for r in rows.iter_mut() { r.push(0.0); }
        *n_total += 1;
    };

    for (coeffs_orig, sense_orig, b_orig) in constraints {
        let mut coeffs = coeffs_orig.clone();
        let mut sense = sense_orig.clone();
        let mut b = *b_orig;
        if b < 0.0 {
            coeffs = coeffs.iter().map(|v| -v).collect();
            b = -b;
            if sense == "<=" { sense = ">=".to_string(); }
            else if sense == ">=" { sense = "<=".to_string(); }
        }
        let mut row = coeffs.clone();
        while row.len() < n_total { row.push(0.0); }
        if sense == "<=" {
            add_var(&mut rows, &mut n_total);
            row.push(1.0);
            basis.push(n_total - 1);
        } else if sense == ">=" {
            add_var(&mut rows, &mut n_total);
            row.push(-1.0);
            add_var(&mut rows, &mut n_total);
            row.push(1.0);
            basis.push(n_total - 1);
            art_indices.push(n_total - 1);
        } else if sense == "=" {
            add_var(&mut rows, &mut n_total);
            row.push(1.0);
            basis.push(n_total - 1);
            art_indices.push(n_total - 1);
        } else {
            panic!("Unknown constraint sense");
        }
        rows.push(row);
        rhs.push(b);
    }
    let tableau: Vec<Vec<f64>> = rows.iter().enumerate().map(|(i, r)| {
        let mut nr = r.clone();
        nr.push(rhs[i]);
        nr
    }).collect();
    (tableau, basis, art_indices, n_total)
}

fn remove_artificial(
    tableau: &mut Vec<Vec<f64>>,
    basis: &mut Vec<usize>,
    art_indices: &[usize],
) -> HashMap<usize, usize> {
    let art_set: std::collections::HashSet<usize> = art_indices.iter().cloned().collect();
    let mut m = basis.len();
    let mut i = 0;
    while i < m {
        if art_set.contains(&basis[i]) {
            let n = tableau[0].len() - 1;
            let mut pivot_col: Option<usize> = None;
            for j in 0..n {
                if art_set.contains(&j) { continue; }
                if tableau[i][j].abs() > EPS_VAL { pivot_col = Some(j); break; }
            }
            if let Some(pc) = pivot_col {
                do_pivot(tableau, basis, i, pc);
                i += 1;
            } else {
                let last = *tableau[i].last().unwrap();
                if last.abs() > EPS_VAL {
                    panic!("Infeasible during artificial removal");
                }
                tableau.remove(i);
                basis.remove(i);
                m -= 1;
            }
        } else { i += 1; }
    }
    let n = tableau[0].len() - 1;
    let keep_cols: Vec<usize> = (0..n).filter(|j| !art_set.contains(j)).collect();
    let mapping: HashMap<usize, usize> = keep_cols.iter().enumerate().map(|(new, &old)| (old, new)).collect();
    let new_tableau: Vec<Vec<f64>> = tableau.iter().map(|row| {
        let mut new_row: Vec<f64> = keep_cols.iter().map(|&j| row[j]).collect();
        new_row.push(*row.last().unwrap());
        new_row
    }).collect();
    let new_basis: Vec<usize> = basis.iter().map(|b| mapping[b]).collect();
    *tableau = new_tableau;
    *basis = new_basis;
    mapping
}

fn solve_lp(n_vars: usize, constraints: &[(Vec<f64>, String, f64)], objective: &[f64]) -> f64 {
    let (mut tableau, mut basis, art_indices, n_total) = build_tableau(n_vars, constraints);
    let mapping: HashMap<usize, usize>;
    if !art_indices.is_empty() {
        let mut c_phase1: Vec<f64> = vec![0.0; n_total];
        for &j in &art_indices { c_phase1[j] = -1.0; }
        set_objective(&mut tableau, &basis, &c_phase1);
        if !simplex_max(&mut tableau, &mut basis) { panic!("Unbounded in phase I"); }
        let last_val = *tableau.last().unwrap().last().unwrap();
        if last_val < -1e-7 { panic!("Infeasible LP"); }
        tableau.pop();
        mapping = remove_artificial(&mut tableau, &mut basis, &art_indices);
    } else {
        mapping = (0..n_total).map(|i| (i, i)).collect();
    }
    let n_total2 = tableau[0].len() - 1;
    let mut c_phase2: Vec<f64> = vec![0.0; n_total2];
    for (j, &coef) in objective.iter().enumerate() {
        if let Some(&mj) = mapping.get(&j) {
            c_phase2[mj] = -coef;
        }
    }
    set_objective(&mut tableau, &basis, &c_phase2);
    if !simplex_max(&mut tableau, &mut basis) { panic!("Unbounded in phase II"); }
    let last = *tableau.last().unwrap().last().unwrap();
    -last
}

fn cartesian_product(arr: &[i32], repeat: usize) -> Vec<Vec<i32>> {
    let mut result: Vec<Vec<i32>> = vec![vec![]];
    for _ in 0..repeat {
        let mut next: Vec<Vec<i32>> = Vec::new();
        for prev in &result {
            for &v in arr {
                let mut new_vec = prev.clone();
                new_vec.push(v);
                next.push(new_vec);
            }
        }
        result = next;
    }
    result
}

fn build_and_solve(num_dice: usize) -> f64 {
    let values: Vec<i32> = vec![1, 2, 3, 4, 5, 6];
    let states = cartesian_product(&values, num_dice);
    let num_states = states.len();
    let hide_options: Vec<usize> = (0..num_dice).collect();

    let mut signal_set: std::collections::HashSet<Vec<i32>> = std::collections::HashSet::new();
    for t in &states {
        for &h in &hide_options {
            let mut revealed: Vec<i32> = t.iter().enumerate().filter(|&(i, _)| i != h).map(|(_, &v)| v).collect();
            revealed.sort();
            signal_set.insert(revealed);
        }
    }
    let mut signals: Vec<Vec<i32>> = signal_set.into_iter().collect();
    signals.sort();
    let signal_index: HashMap<Vec<i32>, usize> = signals.iter().enumerate().map(|(i, s)| (s.clone(), i)).collect();

    let num_x = num_states * num_dice;
    let num_z = signals.len();
    let n_vars = num_x + num_z;

    let x_index = |state_idx: usize, hide_idx: usize| state_idx * num_dice + hide_idx;
    let z_index = |signal_idx: usize| num_x + signal_idx;

    let mut constraints: Vec<(Vec<f64>, String, f64)> = Vec::new();
    let p_state = 1.0 / num_states as f64;

    for s_idx in 0..num_states {
        let mut coeffs = vec![0.0f64; n_vars];
        for &h in &hide_options { coeffs[x_index(s_idx, h)] = 1.0; }
        constraints.push((coeffs, "=".to_string(), p_state));
    }

    for sig in &signals {
        let b_val = *sig.iter().max().unwrap() as f64;
        let sig_idx = signal_index[sig];
        let mut coeffs_vis = vec![0.0f64; n_vars];
        let mut coeffs_hid = vec![0.0f64; n_vars];
        coeffs_vis[z_index(sig_idx)] = -1.0;
        coeffs_hid[z_index(sig_idx)] = -1.0;
        for (s_idx, t) in states.iter().enumerate() {
            for &h in &hide_options {
                let mut revealed: Vec<i32> = t.iter().enumerate().filter(|&(i, _)| i != h).map(|(_, &v)| v).collect();
                revealed.sort();
                if &revealed == sig {
                    coeffs_vis[x_index(s_idx, h)] += b_val;
                    let hidden_val = t[h] as f64;
                    coeffs_hid[x_index(s_idx, h)] += hidden_val;
                }
            }
        }
        constraints.push((coeffs_vis, "<=".to_string(), 0.0));
        constraints.push((coeffs_hid, "<=".to_string(), 0.0));
    }

    let mut objective = vec![0.0f64; n_vars];
    for sig_idx in 0..num_z { objective[z_index(sig_idx)] = 1.0; }

    solve_lp(n_vars, &constraints, &objective)
}

fn main() {
    let val_two = build_and_solve(2);
    let target_exact = 145.0 / 36.0;
    assert!((val_two - target_exact).abs() < 1e-8, "val_two check 1 failed");
    assert!((val_two - 4.027778).abs() < 1e-6, "val_two check 2 failed");
    let val_three = build_and_solve(3);
    println!("{:.6}", val_three);
}
