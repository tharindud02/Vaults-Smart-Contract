import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

(async () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const programId = new PublicKey(
    "9EazK4wyfzy7XzLPnERbdzLhu95KeJTsKejjB2WZzN8h"
  );
  const idl = await anchor.Program.fetchIdl(programId, provider);
  if (!idl) throw new Error("IDL not found for programId");
  const program = new anchor.Program(idl, programId, provider);

  const user = (provider.wallet as anchor.Wallet).publicKey;
  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), user.toBuffer()],
    program.programId
  );

  // Initialize user vault
  await program.methods
    .initialize()
    .accounts({
      vault: vaultPda,
      user,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  // Deposit 100_000 lamports (0.0001 SOL)
  await program.methods
    .deposit(new anchor.BN(100_000))
    .accounts({
      vault: vaultPda,
      user,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  // Withdraw 50_000 lamports
  await program.methods
    .withdraw(new anchor.BN(50_000))
    .accounts({
      vault: vaultPda,
      user,
    })
    .rpc();

  console.log("Done");
})();
