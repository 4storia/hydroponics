
/**
 * Encrypts input where each byte is XOR'd with the previous encrypted byte.
 *
 * @param input - Data to encrypt
 * @param firstKey - Value to XOR first byte of input
 * @returns encrypted buffer
 */
function encrypt(input, firstKey = 0xab) {
    const buf = Buffer.from(input);
    let key = firstKey;
    for (let i = 0; i < buf.length; i += 1) {
        // eslint-disable-next-line no-bitwise
        buf[i] ^= key;
        key = buf[i];
    }
    return buf;
}

/**
 * Encrypts input that has a 4 byte big-endian length header;
 * each byte is XOR'd with the previous encrypted byte.
 *
 * @param input - Data to encrypt
 * @param firstKey - Value to XOR first byte of input
 * @returns encrypted buffer with header
 */
function encryptWithHeader(input, firstKey = 0xab) {
    const msgBuf = encrypt(input, firstKey);
    const outBuf = Buffer.alloc(msgBuf.length + 4);
    outBuf.writeUInt32BE(msgBuf.length, 0);
    msgBuf.copy(outBuf, 4);
    return outBuf;
}

/**
 * Decrypts input where each byte is XOR'd with the previous encrypted byte.
 *
 * @param input - Encrypted Buffer
 * @param firstKey - Value to XOR first byte of input
 * @returns decrypted buffer
 */
function decrypt(input, firstKey = 0xab) {
    const buf = Buffer.from(input);
    let key = firstKey;
    let nextKey;
    for (let i = 0; i < buf.length; i += 1) {
        nextKey = buf[i];
        // eslint-disable-next-line no-bitwise
        buf[i] ^= key;
        key = nextKey;
    }

    return buf.toString('utf8');
}

/**
 * Decrypts input that has a 4 byte big-endian length header;
 * each byte is XOR'd with the previous encrypted byte
 *
 * @param input - Encrypted Buffer with header
 * @param firstKey - Value to XOR first byte of input
 * @returns decrypted buffer
 */
function decryptWithHeader(input, firstKey = 0xab) {
    return decrypt(input.slice(4), firstKey);
}

module.exports = {
    encrypt,
    encryptWithHeader,
    decrypt,
    decryptWithHeader
};