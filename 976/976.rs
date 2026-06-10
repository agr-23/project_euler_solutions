// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/976.py

const MODVAL: u64 = 1234567891;

fn build_inverses(n: usize, modval: u64) -> Vec<u64> {
    let mut inv = vec![0u64; n + 1];
    if n >= 1 {
        inv[1] = 1;
    }
    for i in 2..=n {
        inv[i] = modval - (modval / i as u64) * inv[(modval % i as u64) as usize] % modval;
    }
    inv
}

fn solve() {
    let n: u64 = 10_000_000;
    let k: u64 = 10_000_000;
    let e: u64 = n / 2;
    let a_cnt: u64 = (n + 3) / 4;
    let b_cnt: u64 = (n + 1) / 4;
    let c: i64 = b_cnt as i64 - a_cnt as i64;

    if e == 0 {
        let inv = build_inverses((k + 2) as usize, MODVAL);
        let inv2 = (MODVAL + 1) / 2;
        let mut h: u64 = 1;
        let mut q: u64 = 1;
        let mut sum_odd_a: u64 = 0;
        let mut ans: u64 = 0;
        for s in 0u64..=k {
            if s > 0 {
                h = h * ((a_cnt + b_cnt + s - 1) % MODVAL) % MODVAL * inv[s as usize] % MODVAL;
                if s % 2 == 0 {
                    let r = s / 2;
                    q = q * ((a_cnt + r - 1) % MODVAL) % MODVAL * inv[r as usize] % MODVAL;
                }
            }
            let coeff: u64 = if c == 0 {
                if s % 2 == 0 { q } else { 0 }
            } else if c == 1 {
                q
            } else {
                if s % 2 == 0 { q } else { MODVAL - q }
            };
            let h_odd_a = (h + MODVAL - coeff) % MODVAL * inv2 % MODVAL;
            sum_odd_a = (sum_odd_a + h_odd_a) % MODVAL;
            ans = sum_odd_a;
        }
        println!("{}", ans % MODVAL);
        return;
    }

    let max_inv = (e + k + 2) as usize;
    let inv = build_inverses(max_inv, MODVAL);
    let inv2 = (MODVAL + 1) / 2;

    let mut total_even: u64 = 1;
    for m in 0u64..k {
        total_even = total_even * ((e + m) % MODVAL) % MODVAL * inv[(m + 1) as usize] % MODVAL;
    }

    let qmax = k / 2;
    let mut e0: u64 = 1;
    for q2 in 0u64..qmax {
        e0 = e0 * ((e + q2) % MODVAL) % MODVAL * inv[(q2 + 1) as usize] % MODVAL;
    }

    let mut h: u64 = 1;
    let mut q: u64 = 1;
    let mut qsum: u64 = 1;
    let mut sum_even: u64 = 0;
    let mut sum_odd: u64 = 0;
    let mut sum_odd_a: u64 = 0;
    let mut ans: u64 = 0;
    let ab = a_cnt + b_cnt;

    for s in 0u64..=k {
        if s > 0 {
            h = h * ((ab + s - 1) % MODVAL) % MODVAL * inv[s as usize] % MODVAL;
            if s % 2 == 0 {
                let r = s / 2;
                q = q * ((a_cnt + r - 1) % MODVAL) % MODVAL * inv[r as usize] % MODVAL;
                if c == 1 {
                    qsum = qsum * ((a_cnt + r) % MODVAL) % MODVAL * inv[r as usize] % MODVAL;
                }
            }
        }
        let coeff: u64 = if c == 0 {
            if s % 2 == 0 { q } else { 0 }
        } else if c == 1 {
            qsum
        } else {
            if s % 2 == 0 { q } else { MODVAL - q }
        };
        let h_odd_a = (h + MODVAL - coeff) % MODVAL * inv2 % MODVAL;
        if s % 2 == 0 {
            sum_even = (sum_even + h) % MODVAL;
        } else {
            sum_odd = (sum_odd + h) % MODVAL;
        }
        sum_odd_a = (sum_odd_a + h_odd_a) % MODVAL;
        let m = k - s;
        let (t0, t1): (u64, u64) = if m % 2 == 0 {
            let e0m = e0;
            let t0 = e0m * sum_odd_a % MODVAL;
            let t1 = (total_even + MODVAL - e0m) % MODVAL * sum_even % MODVAL;
            (t0, t1)
        } else {
            (0, total_even * sum_odd % MODVAL)
        };
        ans = (ans + t0 + t1) % MODVAL;
        if m > 0 {
            total_even = total_even * (m % MODVAL) % MODVAL * inv[(e + m - 1) as usize] % MODVAL;
        }
        if m % 2 == 0 && m >= 2 {
            let qcur = m / 2;
            e0 = e0 * (qcur % MODVAL) % MODVAL * inv[(e + qcur - 1) as usize] % MODVAL;
        }
    }
    println!("{}", ans % MODVAL);
}

fn main() {
    solve();
}
