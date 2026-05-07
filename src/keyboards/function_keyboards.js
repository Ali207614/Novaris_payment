const empDynamicBtn = (list = [], count = 1, back = true) => {
    let arr = []
    for (let i = 0; i < list.length; i += count) {
        let el = list
        arr.push(el.slice(i, i + count).map(itemData => {
            return { text: itemData }
        }))
    }
    return {
        parse_mode: "Markdown",
        reply_markup: {
            resize_keyboard: true,
            keyboard: [...arr, ...(back ? [[{ text: 'Orqaga' }]] : [])]
        },
    };
}





module.exports = {
    empDynamicBtn
}