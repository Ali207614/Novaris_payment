const fs = require('fs');

// 1. Fayldan ma'lumotlarni o'qish
const rawData = fs.readFileSync('./data/db/clone.data.json', 'utf-8');
const data = JSON.parse(rawData);

// 2. Iyul 2025 uchun boshlanish va tugash sanalari
const startOfJuly = new Date('2025-07-01T00:00:00.000+05:00');
const endOfJuly = new Date('2025-08-01T00:00:00.000+05:00');

// 3. Iyul oyidagi yozuvlarni filtrlash
const julyItems = data.filter(item => {
    const createdAt = new Date(item.creationDate);
    return createdAt >= startOfJuly && createdAt < endOfJuly;
});

// 4. Natijani data.json fayliga yozish
// fs.writeFileSync('./src/data.json', JSON.stringify(julyItems, null, 2), 'utf-8');

// 5. Statistika chiqarish
console.log('Jami ma\'lumotlar soni:', data.length);
console.log('Iyul oyidagi ma\'lumotlar soni:', julyItems.length);
// console.log('Iyul yozuvlari data.json fayliga saqlandi.');
