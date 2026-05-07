import { generatePQCKeyPair, signCanaryToken, verifyCanaryToken } from './services/pqcService.ts';

try {
	const keys = generatePQCKeyPair();
	console.log("Keys generated");
	const sig = signCanaryToken("test metadata", keys.secretKey);
	console.log("Signature generated");
	const valid = verifyCanaryToken(keys.publicKey, "test metadata", sig);
	console.log("Valid?", valid);
} catch (e) {
	console.error(e);
}
