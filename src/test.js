const { infoData, clone_data } = require("./helpers");

let data = infoData();
console.log(data.length)
// const now = new Date();
// const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
// const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

// const filteredData = data.filter(item => {
//     const creationDate = new Date(item.creationDate);
//     return creationDate >= startOfMonth && creationDate <= endOfMonth;
// });

// console.log(filteredData.length);
// console.log(data.filter(item => !filteredData.map(el => el.id).includes(item.id)).length)

// clone_data(filteredData)
// console.log('tugadi')