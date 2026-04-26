import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';

const seed = new Uint8Array(32);
crypto.getRandomValues(seed);
const keys = ml_dsa65.keygen(seed);

const msg = new TextEncoder().encode('test message');
const sig = ml_dsa65.sign(msg, keys.secretKey);

const tests = [
    { name: 'verify(msg, sig, pub)', fn: () => ml_dsa65.verify(msg, sig, keys.publicKey) },
    { name: 'verify(sig, msg, pub)', fn: () => ml_dsa65.verify(sig, msg, keys.publicKey) },
    { name: 'verify(pub, msg, sig)', fn: () => ml_dsa65.verify(keys.publicKey, msg, sig) },
    { name: 'verify(pub, sig, msg)', fn: () => ml_dsa65.verify(keys.publicKey, sig, msg) },
    { name: 'verify(msg, pub, sig)', fn: () => ml_dsa65.verify(msg, keys.publicKey, sig) },
];

for (const t of tests) {
    try {
        const res = t.fn();
        console.log(`${t.name}: ${res}`);
    } catch (e) {
        console.log(`${t.name}: Error - ${e.message}`);
    }
}
