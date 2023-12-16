const dataConfirmText = (list = [], firstText = 'Tasdiqlaysizmi ? ') => {
    let result = `${firstText}\n\n`
    for (let i = 0; i < list.length; i++) {
        result += `${list[i].name} : ${list[i].message}\n`
    }
    return result
}

module.exports = {
    dataConfirmText
}