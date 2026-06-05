// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/996.py

fn trim(poly: &mut Vec<i64>) -> &mut Vec<i64> {
    while poly.len() > 1 && *poly.last().unwrap() == 0 {
        poly.pop();
    }
    poly
}

fn add_to(dst: &mut Vec<i64>, src: &Vec<i64>, modulus: Option<i64>) {
    if dst.len() < src.len() {
        dst.resize(src.len(), 0);
    }
    match modulus {
        None => {
            for (i, &value) in src.iter().enumerate() {
                dst[i] += value;
            }
        }
        Some(m) => {
            for (i, &value) in src.iter().enumerate() {
                dst[i] = (dst[i] + value) % m;
            }
        }
    }
}

fn mul_one_minus_q(poly: &Vec<i64>, modulus: Option<i64>) -> Vec<i64> {
    let mut out = vec![0i64; poly.len() + 1];
    for (i, &value) in poly.iter().enumerate() {
        out[i] += value;
        out[i + 1] -= value;
    }
    if let Some(m) = modulus {
        out = out.iter().map(|&v| v % m).collect();
    }
    trim(&mut out);
    out
}

fn mul_poly(a: &Vec<i64>, b: &Vec<i64>, max_degree: usize, modulus: Option<i64>) -> Vec<i64> {
    if a.is_empty() || b.is_empty() {
        return vec![0];
    }
    let out_len = (a.len() + b.len() - 2).min(max_degree) + 1;
    let mut out = vec![0i64; out_len];
    for (i, &ai) in a.iter().enumerate() {
        if ai == 0 {
            continue;
        }
        let last_j = (b.len() - 1).min(if max_degree >= i { max_degree - i } else { 0 });
        for j in 0..=last_j {
            let bj = b[j];
            if bj != 0 {
                out[i + j] += ai * bj;
                if let Some(m) = modulus {
                    out[i + j] %= m;
                }
            }
        }
    }
    if let Some(m) = modulus {
        out = out.iter().map(|&v| v % m).collect();
    }
    trim(&mut out);
    out
}

fn comb(n: i64, k: i64) -> i64 {
    if k < 0 || k > n {
        return 0;
    }
    if k == 0 || k == n {
        return 1;
    }
    let k = k.min(n - k);
    let mut result = 1i64;
    for i in 0..k {
        result = result * (n - i) / (i + 1);
    }
    result
}

fn block_count(length: i64, cost: i64) -> i64 {
    if cost <= 0 || 2 * cost < length {
        return 0;
    }
    let total = comb(2 * cost - 1, length - 1);
    let too_large = if cost < length { 0 } else { comb(cost - 1, length - 1) };
    total - length * too_large
}

fn block_numerator(length: usize, modulus: Option<i64>) -> Vec<i64> {
    let mut coeffs = vec![0i64; length + 1];
    for j in 0..=length {
        let mut value: i64 = 0;
        for i in 0..=j {
            let sign: i64 = if i % 2 == 0 { 1 } else { -1 };
            value += sign * comb(length as i64, i as i64) * block_count(length as i64, (j - i) as i64);
        }
        coeffs[j] = match modulus {
            Some(m) => value % m,
            None => value,
        };
    }
    trim(&mut coeffs);
    coeffs
}

fn numerator_for_all_valid_vectors(n: usize, modulus: Option<i64>) -> Vec<i64> {
    let mut block_num: Vec<Option<Vec<i64>>> = vec![None; n + 1];
    for length in 2..=n {
        block_num[length] = Some(block_numerator(length, modulus));
    }

    let mut total: Vec<Vec<i64>> = vec![vec![]; n + 1];
    let mut zero_end: Vec<Vec<i64>> = vec![vec![]; n + 1];
    total[0] = vec![1];
    zero_end[0] = vec![1];

    for pos in 0..=n {
        if pos < n && !total[pos].is_empty() {
            let add_zero = mul_one_minus_q(&total[pos].clone(), modulus);
            add_to(&mut total[pos + 1], &add_zero, modulus);
            add_to(&mut zero_end[pos + 1], &add_zero, modulus);
        }
        if !zero_end[pos].is_empty() {
            for length in 2..=(n - pos) {
                let bn = block_num[length].clone().unwrap();
                let product = mul_poly(&zero_end[pos].clone(), &bn, pos + length, modulus);
                add_to(&mut total[pos + length], &product, modulus);
            }
        }
    }

    total[n].clone()
}

fn count_tuples(n: usize, k: i64, modulus: Option<i64>) -> i64 {
    let max_cost = k / 2;
    let numerator = numerator_for_all_valid_vectors(n, modulus);
    let mut answer: i64 = 0;
    for (degree, &coeff) in numerator.iter().enumerate() {
        if coeff == 0 || degree as i64 > max_cost {
            continue;
        }
        let ways_up_to_cost = comb(max_cost - degree as i64 + n as i64, n as i64);
        match modulus {
            None => {
                answer += coeff * ways_up_to_cost;
            }
            Some(m) => {
                answer = (answer + coeff * (ways_up_to_cost % m)) % m;
            }
        }
    }
    answer
}

fn run_tests() {
    assert_eq!(count_tuples(3, 4, None), 8);
    assert_eq!(count_tuples(12, 34, None), 2457178250);
}

fn main() {
    run_tests();
    println!("{}", count_tuples(123, 4567891, Some(1234567891)));
}