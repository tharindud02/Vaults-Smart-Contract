# Vault-SC (Solana + Anchor)
A minimal **Vault** smart contract (program) on Solana built with **Anchor**. Each user gets a **Program Derived Address (PDA)** vault to deposit SOL and withdraw it later, with owner-only access control.

> This README is optimized for developing in **Cursor**. It includes exact commands you can copy‑paste.

---

## ✨ What this program does

- Creates a **per‑user vault** PDA: `PDA = seeds("vault", userPubkey)`
- **Deposit SOL** into the vault via a CPI to the **System Program**
- **Withdraw SOL** back to the owner (authority) only
- Stores only two fields on chain:
  - `authority: Pubkey` (the owner)
  - `bump: u8` (PDA bump seed)

---

## 🧠 Architecture & Concepts

- **Accounts live in PDAs**: the program owns the vault; no private keys.
- **CPI (Cross‑Program Invocation)**: used to transfer SOL securely.
- **Access Control**: Anchor account constraints + custom error on unauthorized withdraw.

**Seeds**
```
[b"vault", user.key().as_ref()]
```

---

## 📁 Project Structure

```
Vault-SC/
├─ Anchor.toml                # Anchor workspace config
├─ Cargo.toml                 # Workspace deps
├─ programs/
│  └─ vault/
│     ├─ Cargo.toml
│     └─ src/lib.rs           # Program logic (initialize, deposit, withdraw)
├─ tests/                     # (Optional) client scripts/tests
└─ README.md                  # You are here
```

---

## ⚙️ Prerequisites

- Rust toolchain
- Solana CLI (Agave)
- Anchor CLI

Check they’re on your PATH:
```bash
solana --version
anchor --version
rustc --version
```

> If versions are missing, install from the official docs.

---

## ▶️ How to Run

- Quick steps are below in Quick Start. For a detailed, copy‑paste guide (localnet + devnet), see `HOW_TO_RUN.md`.

---

## 🚀 Quick Start (Localnet)

1) Start a local validator (terminal A):
```bash
solana-test-validator --reset
```

2) In another terminal (terminal B), configure localnet and fund your wallet:
```bash
solana config set -ul
solana airdrop 5
```

3) Build and deploy the program:
```bash
anchor build
anchor deploy
```

4) When `anchor deploy` prints a **Program Id**, paste it into:
- `programs/vault/src/lib.rs` → `declare_id!("YOUR_PROGRAM_ID_HERE");`
- `Anchor.toml` under `[programs.localnet]`

5) Rebuild once after updating the Program Id:
```bash
anchor build && anchor deploy
```

---

## 🧩 Instruction & Account Reference

### Instructions
| Name        | Purpose                                   | Accounts (short)                        |
|-------------|--------------------------------------------|-----------------------------------------|
| `initialize`| Create the user's PDA vault               | `vault(pda, init)`, `user(signer)`      |
| `deposit`   | Transfer SOL into the vault (CPI)         | `vault(pda, mut)`, `user(signer, mut)`, `system_program` |
| `withdraw`  | Move SOL from vault back to the authority | `vault(pda, mut)`, `user(signer, mut)`  |

### Accounts
- **VaultAccount**
  - `authority: Pubkey` (owner)
  - `bump: u8` (pda bump)
  - Space: `8 (disc) + 32 + 1 = 41` bytes

### PDA Derivation
```rust
#[account(
  init,
  payer = user,
  seeds = [b"vault", user.key().as_ref()],
  bump,
  space = 8 + 32 + 1
)]
```

---

## 🛠 Interacting from a Client (TypeScript)

Create `tests/client.ts` (or a script in `scripts/`) and run with `ts-node`. Example:

```ts
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

(async () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const programId = new PublicKey("REPLACE_WITH_PROGRAM_ID");
  const idl = await anchor.Program.fetchIdl(programId, provider);
  const program = new anchor.Program(idl!, programId, provider);

  const user = (provider.wallet as anchor.Wallet).publicKey;
  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), user.toBuffer()],
    program.programId
  );

  // Initialize user vault
  await program.methods.initialize().accounts({
    vault: vaultPda,
    user,
    systemProgram: SystemProgram.programId,
  }).rpc();

  // Deposit 100_000 lamports (0.0001 SOL)
  await program.methods.deposit(new anchor.BN(100_000)).accounts({
    vault: vaultPda,
    user,
    systemProgram: SystemProgram.programId,
  }).rpc();

  // Withdraw 50_000 lamports
  await program.methods.withdraw(new anchor.BN(50_000)).accounts({
    vault: vaultPda,
    user,
  }).rpc();

  console.log("Done");
})();
```

Run:
```bash
npx ts-node -T tests/client.ts
```

---

## 🌐 Deploying to Devnet

```bash
solana config set -ud
solana airdrop 2           # if faucet available
anchor deploy
```

Update `declare_id!` and `Anchor.toml` with the new **Program Id** if you redeploy.

---

## 🔒 Security Notes (Read This)

- Require the **correct PDA** with `seeds` + `bump` in every instruction.
- Keep **authority‑only** actions guarded (we use `require!` for withdraw).
- Use **checked arithmetic** for balances when applicable.
- Consider making the program **upgrade‑restricted** (e.g., multisig) in production.

---

## ➕ Extensions You Can Add

- **SPL Token vaults** (Token Program CPI)
- **Multi‑sig withdraw** (m‑of‑n authorities)
- **Fees / treasury** for protocol revenue
- **Events** for deposit/withdraw hooks on the frontend
- **Rent exemption checks** for long‑lived accounts

---

## 🧰 Troubleshooting

- **`AccountNotFound`**: Ensure `initialize` ran and PDA seeds match.
- **`Program Id mismatch`**: Rebuild after updating `declare_id!` and `Anchor.toml`.
- **`Airdrop` fails**: Use localnet or fund from another wallet.
- **`custom program error`**: Read Anchor logs in the validator terminal for the error code.

---

## 📄 License
MIT (or your choice)

---
