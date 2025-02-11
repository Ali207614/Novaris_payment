const Axios = require("axios");
const https = require("https");
const { get } = require("lodash");
const { jiraToken } = require("./src/config");

let authKey = `Basic ${Buffer.from(
    `ferrotelegrambot@gmail.com:${jiraToken}`
).toString('base64')}`

async function getTicketById({ issueKey }) {
    const axios = Axios.create({
        baseURL: `https://tisco-uz.atlassian.net/rest/api/2/`,
        timeout: 30000,
        headers: {
            'Authorization': authKey,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    });
    return axios
        .get(`issue/${issueKey}/transitions`,)
        .then(({ data }) => {
            console.log(data)
            console.log(get(data, 'transitions[2].to', 0))
            return { status: true, data }
        })
        .catch(async (err) => {
            return { status: false, message: get(err, 'response.data.errorMessages', 'Error') }
        });
}

// 10010
// 10030
// 41
getTicketById({ issueKey: 'XAR-3045' })


let str = `1) Sana:
2) Zakaz nomeri: 
3) Yetkazib beruvchi:
4) Tovar nomi:
5) Tovar sonida o'zgarish bor/yo'q:
6) Tovar sifatini bizni shartlar asosida qilingani:
7) Tovar upakofkasini tekshirish:
8) Poddon spiska ma'lumoti:
9) Tovar dizayni tekshirish:

10) Izoh: 

#zakaz_tayyor
#24462IO(zakaz nomeri)
`

console.log(JSON.stringify(str))