// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/980.py

fn build_mul_table_q8() -> [[i32; 8]; 8] {
    let mut base_arr = [[0i32; 4]; 4];
    let mut sgn_arr = [[1i32; 4]; 4];
    for a in 0..4usize {
        for b in 0..4usize {
            if a == 0 {
                base_arr[a][b] = b as i32;
                sgn_arr[a][b] = 1;
            } else if b == 0 {
                base_arr[a][b] = a as i32;
                sgn_arr[a][b] = 1;
            } else if a == b {
                base_arr[a][b] = 0;
                sgn_arr[a][b] = -1;
            } else {
                match (a, b) {
                    (1, 2) => { base_arr[a][b] = 3; sgn_arr[a][b] = 1; }
                    (2, 3) => { base_arr[a][b] = 1; sgn_arr[a][b] = 1; }
                    (3, 1) => { base_arr[a][b] = 2; sgn_arr[a][b] = 1; }
                    (2, 1) => { base_arr[a][b] = 3; sgn_arr[a][b] = -1; }
                    (3, 2) => { base_arr[a][b] = 1; sgn_arr[a][b] = -1; }
                    (1, 3) => { base_arr[a][b] = 2; sgn_arr[a][b] = -1; }
                    _ => panic!("Unexpected basis multiplication case"),
                }
            }
        }
    }
    let mut mul_table = [[0i32; 8]; 8];
    for big_a in 0..8usize {
        let sa: i32 = if big_a < 4 { 1 } else { -1 };
        let a = big_a & 3;
        for big_b in 0..8usize {
            let sb: i32 = if big_b < 4 { 1 } else { -1 };
            let b = big_b & 3;
            let s = sa * sb * sgn_arr[a][b];
            let c = base_arr[a][b];
            mul_table[big_a][big_b] = if s == 1 { c } else { c ^ 4 };
        }
    }
    mul_table
}

fn build_r_table(mul_table: &[[i32; 8]; 8], gen_elems: &[usize; 3]) -> [i32; 24] {
    let mut r_table = [0i32; 24];
    for v in 0..8usize {
        for b in 0..3usize {
            r_table[v * 3 + b] = mul_table[v][gen_elems[b]];
        }
    }
    r_table
}

fn build_inv_table(mul_table: &[[i32; 8]; 8]) -> [usize; 8] {
    let mut inv_table = [0usize; 8];
    for e in 0..8usize {
        for f in 0..8usize {
            if mul_table[e][f] == 0 && mul_table[f][e] == 0 {
                inv_table[e] = f;
                break;
            }
        }
    }
    inv_table
}

fn compute_f(n_val: i64, r_table: &[i32; 24], inv_table: &[usize; 8]) -> i64 {
    const MOD: i64 = 888_888_883;
    const MULT: i64 = 8888;
    let mut a_val: i64 = 88_888_888;
    let mut cnts = [0i64; 8];
    for _iter in 0..n_val {
        let mut v: usize = 0;
        for _step in 0..50 {
            v = r_table[v * 3 + (a_val % 3) as usize] as usize;
            a_val = (a_val * MULT) % MOD;
        }
        cnts[v] += 1;
    }
    let mut total: i64 = 0;
    for e in 0..8usize {
        total += cnts[e] * cnts[inv_table[e]];
    }
    total
}

fn main() {
    let mul_table = build_mul_table_q8();
    let gen_elems: [usize; 3] = [1, 2, 7];
    let r_table = build_r_table(&mul_table, &gen_elems);
    let inv_table = build_inv_table(&mul_table);

    let r10 = compute_f(10, &r_table, &inv_table);
    assert_eq!(r10, 13, "Assert F(10) == 13 failed, got {}", r10);
    let r100 = compute_f(100, &r_table, &inv_table);
    assert_eq!(r100, 1224, "Assert F(100) == 1224 failed, got {}", r100);
    let result = compute_f(1_000_000, &r_table, &inv_table);
    println!("{}", result);
}
