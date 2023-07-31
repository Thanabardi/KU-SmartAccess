global.Buffer = global.Buffer || require('buffer').Buffer;

function stringToHex(str) {
    const hex = Buffer.from(str, 'utf8').toString('hex');
    return hex;
}

export default stringToHex