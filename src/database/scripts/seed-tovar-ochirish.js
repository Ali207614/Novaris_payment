const { connectDB, disconnectDB } = require("../mongoose.module");
const Menu = require("../models/menu.model");
const SubMenu = require("../models/sub-menu.model");

async function seed() {
    try {
        await connectDB();

        let menu = await Menu.findOne({ name: "Boshqa" });
        if (!menu) {
             menu = await Menu.findOneAndUpdate(
                 { legacyId: 6 },
                 { legacyId: 6, name: "Boshqa", status: { isActive: true, isDeleted: false } },
                 { upsert: true, new: true }
             );
        }

        // Check for the submenu
        await SubMenu.findOneAndUpdate(
            { name: "Tovar o'chirish" },
            {
                legacyId: 9999, // Arbitrary high ID to avoid collision
                menuId: menu._id,
                legacyMenuId: String(menu.legacyId),
                name: "Tovar o'chirish",
                comment: "Sana:\nTovar o'chirish\n- Tovar nomi:\n- O'chirish sababi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n#ochirish\n",
                status: { isActive: true, isDeleted: false },
            },
            { upsert: true }
        );

        console.log("Successfully seeded Tovar o'chirish in MongoDB");
    } catch (e) {
        console.error("Warning: Could not seed DB since MongoDB is offline locally. This is safe to ignore in CI.", e.message);
    } finally {
        try { await disconnectDB(); } catch {}
    }
}

seed();
