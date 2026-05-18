const COMMENT_MAX_LENGTH = Number(process.env.COMMENT_MAX_LENGTH || 3000);

const validateCommentLength = (value = "", maxLength = COMMENT_MAX_LENGTH) => {
    const text = String(value ?? "");

    if (text.length <= maxLength) {
        return { ok: true, length: text.length, maxLength };
    }

    return {
        ok: false,
        length: text.length,
        maxLength,
        message: `Kommentariya juda uzun. Maksimum ${maxLength} ta belgi, siz ${text.length} ta belgi yubordingiz. Iltimos, qisqartirib qayta yuboring.`
    };
};

module.exports = {
    COMMENT_MAX_LENGTH,
    validateCommentLength
};
