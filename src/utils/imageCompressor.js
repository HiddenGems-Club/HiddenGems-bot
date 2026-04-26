const sharp = require("sharp");

const MAX_WIDTH = 1280;
const QUALITY = 70;

async function fetchAndCompress(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);

        const arrayBuffer = await res.arrayBuffer();
        const inputBuffer = Buffer.from(arrayBuffer);

        const compressedData = await sharp(inputBuffer)
            .resize({ width: MAX_WIDTH, withoutEnlargement: true })
            .webp({ quality: QUALITY })
            .toBuffer();

        return { compressedData, mimeType: "image/webp" };
    } catch (err) {
        console.error(`[ImageCompressor] Failed to process image at ${url}:`, err);
        return null;
    }
}

async function processAttachments(attachments) {
    const imageAttachments = attachments.filter(
        (a) => a.contentType && a.contentType.startsWith("image/")
    );

    const results = [];

    for (const attachment of imageAttachments) {
        const result = await fetchAndCompress(attachment.url);
        if (result) {
            results.push({ originalUrl: attachment.url, ...result });
        }
    }

    return results;
}

module.exports = { processAttachments };