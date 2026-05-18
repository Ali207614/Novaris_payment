const TELEGRAM_MESSAGE_LIMIT = 4096;
const TELEGRAM_SAFE_MESSAGE_LIMIT = 3900;
const TELEGRAM_CAPTION_LIMIT = 1024;
const TELEGRAM_SAFE_CAPTION_LIMIT = 1000;

const splitLongWord = (word, limit) => {
    const parts = [];
    for (let i = 0; i < word.length; i += limit) {
        parts.push(word.slice(i, i + limit));
    }
    return parts;
};

const splitTelegramText = (value = "", limit = TELEGRAM_SAFE_MESSAGE_LIMIT) => {
    const text = String(value ?? "");

    if (text.length <= limit) {
        return [text];
    }

    const chunks = [];
    let current = "";
    const lines = text.split("\n");

    for (const line of lines) {
        const lineWithBreak = current ? `\n${line}` : line;

        if ((current + lineWithBreak).length <= limit) {
            current += lineWithBreak;
            continue;
        }

        if (current) {
            chunks.push(current);
            current = "";
        }

        if (line.length <= limit) {
            current = line;
            continue;
        }

        const words = line.split(/(\s+)/);
        for (const word of words) {
            if (!word) continue;

            if (word.length > limit) {
                if (current) {
                    chunks.push(current);
                    current = "";
                }
                chunks.push(...splitLongWord(word, limit));
                continue;
            }

            if ((current + word).length > limit) {
                chunks.push(current);
                current = word.trimStart();
            } else {
                current += word;
            }
        }
    }

    if (current) {
        chunks.push(current);
    }

    return chunks.length ? chunks : [""];
};

module.exports = {
    TELEGRAM_MESSAGE_LIMIT,
    TELEGRAM_SAFE_MESSAGE_LIMIT,
    TELEGRAM_CAPTION_LIMIT,
    TELEGRAM_SAFE_CAPTION_LIMIT,
    splitTelegramText
};
