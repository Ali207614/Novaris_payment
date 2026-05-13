
const fs = require('fs');
const path = require('path');
const { connectDB, disconnectDB } = require('../src/database/mongoose.module');

async function fixShohjahon() {
    await connectDB();
    
    // Read the local JSON file
    const FILE_PATH = path.join(process.cwd(), "data", "db", "permisson.json");
    const raw = fs.readFileSync(FILE_PATH, "utf-8");
    const allPermissions = JSON.parse(raw);
    
    const shohjahon = allPermissions.find(p => p.chat_id == 8641624618);
    
    if (shohjahon) {
        if (!shohjahon.permissonMenuEmp["6"].includes("9999")) {
            shohjahon.permissonMenuEmp["6"].push("9999");
        }
        
        fs.writeFileSync(FILE_PATH, JSON.stringify(allPermissions, null, 4));
        console.log('Added 9999 to permissonMenuEmp["6"].');
        
        const permissionRepository = require('../src/database/repositories/permission.repository');
        const { mapLegacyPermissionToMongoList } = require('../src/helpers/mongoLegacyMapper');
        
        const permissions = mapLegacyPermissionToMongoList(shohjahon);
        
        await permissionRepository.replaceUserPermissions(8641624618, permissions);
        console.log('Updated in MongoDB successfully.');
    } else {
        console.log('Shohjahon not found in JSON!');
    }
    
    await disconnectDB();
}

fixShohjahon().catch(console.error);
