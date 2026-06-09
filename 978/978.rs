// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/978.py

fn skewness_at(t: i32) -> String {
    if t < 0 { panic!("t must be non-negative"); }
    if t == 0 { panic!("Skewness at t=0 is undefined (variance 0)."); }
    if t == 1 { panic!("Skewness at t=1 is undefined (variance 0)."); }

    let mut a0: i64 = 0;
    let mut a1: i64 = 1;
    let mut m0: i64 = 0;
    let mut m1: i64 = 1;

    for _ in 2..=t {
        let a_new = a1 + a0;
        a0 = a1;
        a1 = a_new;
        let m_new = m1 + 3 * m0;
        m0 = m1;
        m1 = m_new;
    }

    let a_t = a1;
    let m_t = m1;
    let mu: i64 = 1;
    let var_val: i64 = a_t - mu * mu;

    if var_val <= 0 { panic!("Variance is non-positive; skewness undefined."); }

    let central3: i64 = m_t - 3 * a_t + 2;

    let central3_f: f64 = central3 as f64;
    let var_f: f64 = var_val as f64;
    let sigma3_f: f64 = var_f.sqrt().powi(3);
    let skew_f: f64 = central3_f / sigma3_f;

    let factor: f64 = 1e8_f64;
    let shifted: f64 = skew_f * factor;
    let floored: f64 = shifted.floor();
    let frac: f64 = shifted - floored;
    let rounded_i: i64 = if frac >= 0.5 {
        floored as i64 + 1
    } else {
        floored as i64
    };

    let int_part: i64 = rounded_i / 100_000_000i64;
    let frac_part: i64 = rounded_i.abs() % 100_000_000i64;

    format!("{}.{:08}", int_part, frac_part)
}

fn main() {
    let sk5 = skewness_at(5);
    assert_eq!(sk5, "0.75000000", "Assert failed: sk5={}", sk5);

    let sk10 = skewness_at(10);
    let sk10_num: f64 = sk10.parse().unwrap();
    assert!((sk10_num - 2.50997097_f64).abs() < 1e-8_f64, "Assert failed: sk10={}", sk10);

    let sk50 = skewness_at(50);
    println!("{}", sk50);
}
