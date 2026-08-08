const { encryptSensitiveData, decryptSensitiveData } = require('../lib/crypto.ts');

const secretText = 'user-social-token-secret-12345';
console.log('Original Text:', secretText);

const encrypted = encryptSensitiveData(secretText);
console.log('Encrypted Hex:', encrypted);

const decrypted = decryptSensitiveData(encrypted);
console.log('Decrypted Text:', decrypted);

if (secretText === decrypted) {
  console.log('✅ AES-256-GCM Encryption/Decryption roundtrip PASSED!');
} else {
  console.error('❌ Encryption test failed!');
  process.exit(1);
}
