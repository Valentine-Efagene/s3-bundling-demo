import { Transform, TransformCallback } from 'node:stream'

export class ByteLogger extends Transform {
    private bytesTransferred = 0;

    _transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback) {
        this.bytesTransferred += chunk.length;
        console.log(`Transferred ${chunk.length} bytes. Total: ${this.bytesTransferred} bytes.`);
        this.push(chunk); // Pass data along
        callback();
    }
}