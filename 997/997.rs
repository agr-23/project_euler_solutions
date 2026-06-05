// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/997.py

fn compute(px: u64, py: u64, pz: u64) -> u64 {
    3 * (1 << (px + py + pz - 1)) * ((1 << px) + (1 << py) + (1 << pz) - 4)
}

fn main() {
    assert_eq!(compute(1, 1, 1), 24);
    assert_eq!(compute(2, 3, 4), 18432);
    println!("{}", compute(9, 10, 11));
}