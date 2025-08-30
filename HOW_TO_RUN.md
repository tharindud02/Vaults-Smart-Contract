## Vault-SC: How to Run (Localnet + Optional Devnet)

This guide shows the quickest way to build, deploy, and test the Vault program.

### 1) Prerequisites

- Rust toolchain
- Solana CLI (Agave)
- Anchor CLI 0.31.1 (managed by avm)

Verify:

```bash
solana --version
anchor --version
rustc --version
```

If Anchor is missing:

```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm use 0.31.1
anchor --version
```

### 2) Start Local Validator and Fund Wallet

In terminal A:

```bash
solana-test-validator --reset
```

In terminal B:

```bash
solana config set -ul
solana airdrop 5
```

### 3) Build and Deploy the Program (Localnet)

```bash
anchor build
anchor deploy
```

The deploy prints a Program Id, for example:

```text
Program Id: 9EazK4wyfzy7XzLPnERbdzLhu95KeJTsKejjB2WZzN8h
```

Confirm the same Program Id is set in both locations (this repo is already wired):

- `programs/vault/src/lib.rs` → `declare_id!("...");`
- `Anchor.toml` → under `[programs.localnet]`

If you change the Program Id, rebuild and redeploy once:

```bash
anchor build && anchor deploy
```

### 4) Run the TypeScript Client (Localnet)

Install minimal deps (one-time):

```bash
npm init -y
npm i -D ts-node typescript @types/node
npm i @coral-xyz/anchor @solana/web3.js
```

Execute the example client:

```bash
npx ts-node -T tests/client.ts
```

Expected: the script initializes your PDA vault, deposits 100_000 lamports, then withdraws 50_000 lamports and prints "Done".

Optional: check balances

```bash
solana balance
solana account <VAULT_PDA>
```

### 5) Troubleshooting

- Platform tools error when building:

```bash
anchor build -- --force-tools-install
```

- Mismatch between CLI and crates: ensure both use Anchor 0.31.1. The repo is set to 0.31.1 in `Anchor.toml` and `programs/vault/Cargo.toml`.
- IDL not found from client: run `anchor build` and deploy again to generate and cache the IDL.
- Program Id mismatch: update `declare_id!` and `Anchor.toml`, then `anchor build && anchor deploy`.

### (Optional) 6) Deploy to Devnet

```bash
solana config set -ud
solana airdrop 2   # if faucet available
anchor deploy
```

Update `declare_id!` and `Anchor.toml` with the new Devnet Program Id if you redeploy.
