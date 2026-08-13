import type { FastifyInstance, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import crypto from "crypto";

const walletEncryptionPlugin = async (instance: FastifyInstance) => {
  const ENCRYPTION_KEY = instance.configs.payment.balanceEncryptionKey;
  const IV_LENGTH = 16; // AES block size (128-bit

  instance.decorate("encryptBalance", async (balance: string | number) => {
    balance = balance.toString();

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY),
      iv
    );

    let encrypted = cipher.update(balance);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString("hex") + ":" + encrypted.toString("hex");
  });

  instance.decorate("decryptBalance", async (balance: string) => {
    if (!balance.includes(":")) return balance;

    const [iv, encryptedText] = balance.split(":");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY),
      Buffer.from(iv, "hex")
    );

    let decrypted = decipher.update(Buffer.from(encryptedText, "hex"));
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  });
};

export default fp(walletEncryptionPlugin, {
  name: "wallet-encryption-plugin",
});
