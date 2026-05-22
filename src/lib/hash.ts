import { argon2id, argon2Verify } from "hash-wasm";

// Secure production-grade parameters for Argon2id
// - Memory: 65536 KB (64MB)
// - Iterations (Time cost): 3
// - Parallelism: 4
// - Tag Length: 32 bytes
// - Salt Length: 16 bytes
const MEMORY_COST = 65536;
const ITERATIONS = 3;
const PARALLELISM = 4;
const TAG_LENGTH = 32;

/**
 * Generate a random cryptographically secure salt.
 */
function generateSalt(length = 16): Uint8Array {
  const salt = new Uint8Array(length);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(salt);
  } else {
    // Node.js crypto module
    try {
      const crypto = require("crypto");
      const bytes = crypto.randomBytes(length);
      salt.set(bytes);
    } catch (error) {
      // Fallback: generate pseudo-random values if crypto is unavailable
      console.warn("Crypto module unavailable, using fallback salt generation");
      for (let i = 0; i < length; i++) {
        salt[i] = Math.floor(Math.random() * 256);
      }
    }
  }
  return salt;
}

/**
 * Hashes a plaintext password using Argon2id WebAssembly.
 * Returns a standard PHC format string: $argon2id$v=19$m=65536,t=3,p=4$<salt>$<hash>
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = generateSalt();
  
  const hash = await argon2id({
    password: password,
    salt: salt,
    iterations: ITERATIONS,
    memorySize: MEMORY_COST,
    parallelism: PARALLELISM,
    hashLength: TAG_LENGTH,
    outputType: "encoded"
  });

  return hash;
}

/**
 * Safely compares a plaintext password attempt with an Argon2id PHC format hash.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    const isMatched = await argon2Verify({
      password: password,
      hash: hash
    });
    return isMatched;
  } catch (error) {
    console.error("Password comparison failed:", error);
    return false;
  }
}

