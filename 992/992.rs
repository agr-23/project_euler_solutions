// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/992.py

const MOD: u64 = 987_898_789;

fn build_combinatorics(limit: usize, modv: u64) -> (Vec<u64>, Vec<u64>) {
    let mut fact = vec![1u64; limit + 1];
    for i in 1..=limit {
        fact[i] = fact[i - 1] * (i as u64) % modv;
    }
    let mut inv_fact = vec![1u64; limit + 1];
    inv_fact[limit] = mod_pow(fact[limit], modv - 2, modv);
    for i in (1..=limit).rev() {
        inv_fact[i - 1] = inv_fact[i] * (i as u64) % modv;
    }
    (fact, inv_fact)
}

fn mod_pow(mut base: u64, mut exp: u64, modulus: u64) -> u64 {
    let mut result = 1u64;
    base %= modulus;
    while exp > 0 {
        if exp & 1 == 1 {
            result = result * base % modulus;
        }
        exp >>= 1;
        base = base * base % modulus;
    }
    result
}

struct Comb {
    modv: u64,
    fact: Vec<u64>,
    inv_fact: Vec<u64>,
}

impl Comb {
    fn new(limit: usize, modv: u64) -> Self {
        let (fact, inv_fact) = build_combinatorics(limit, modv);
        Comb { modv, fact, inv_fact }
    }

    fn call(&self, n: i64, r: i64) -> u64 {
        if r < 0 || r > n {
            return 0;
        }
        let n = n as usize;
        let r = r as usize;
        self.fact[n] * self.inv_fact[r] % self.modv * self.inv_fact[n - r] % self.modv
    }
}

fn endpoint_count(n: usize, k: i64, end: usize, comb: &Comb, modv: u64) -> u64 {
    if n == 0 {
        return 1;
    }
    let mut right = vec![0i64; n];
    right[0] = k - (if end == 0 { 1 } else { 0 });
    if n >= 2 {
        right[1] = 2 - (if end == 1 { 1 } else { 0 });
    }
    for i in 2..n {
        right[i] = 1 + right[i - 2] - (if end == i { 1 } else { 0 });
    }
    let mut ways = 1u64;
    for v in 1..n {
        let out_degree = k + v as i64 - (if end == v { 1 } else { 0 });
        if v < end {
            ways = ways * comb.call(out_degree - 1, right[v] - 1) % modv;
        } else if v == end {
            ways = ways * comb.call(out_degree, right[v]) % modv;
        } else {
            ways = ways * comb.call(out_degree - 1, right[v]) % modv;
        }
    }
    ways
}

fn journey_count(n: usize, k: i64, comb: &Comb, modv: u64) -> u64 {
    let mut total = 0u64;
    for end in 0..=(n as usize) {
        total = (total + endpoint_count(n, k, end, comb, modv)) % modv;
    }
    total
}

fn solve() -> u64 {
    let n: usize = 500;
    let ks: Vec<i64> = vec![1, 10, 100, 1000, 10000];
    let max_k = *ks.iter().max().unwrap();
    let comb = Comb::new((max_k as usize) + n, MOD);
    assert_eq!(journey_count(3, 2, &comb, MOD), 17);
    assert_eq!(journey_count(6, 1, &comb, MOD), 1320);
    assert_eq!(journey_count(6, 5, &comb, MOD), 16_793_280);
    let mut answer = 0u64;
    for k in &ks {
        answer = (answer + journey_count(n, *k, &comb, MOD)) % MOD;
    }
    answer
}

fn main() {
    println!("{}", solve());
}
