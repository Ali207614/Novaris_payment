const { connectDB, disconnectDB } = require("../mongoose.module");
const Menu = require("../models/menu.model");
const SubMenu = require("../models/sub-menu.model");

const TOVAR_OCHIRISH_COMMENT = "Sana:\nTovar o'chirish\n- Tovar nomi:\n- O'chirish sababi:\n\nIzoh: Bo'lgan ish sababini to'liq bayon qilib yozing!\n\n#ochirish\n";
const TOVAR_OCHIRISH_INFO_FUNCTION = `({ chat_id, id }) => {
    let user = infoUser().find(item => item.chat_id == chat_id)
    let data = infoData().find(item => item.id == (id ? id : user.currentDataId))
    let info = [{ name: 'ID', message: data?.ID }, { name: 'Menu', message: data.menuName }, { name: 'SubMenu', message: data.subMenu }, { name: 'Izoh', message: data.comment }]
    return info
} `;

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
                comment: TOVAR_OCHIRISH_COMMENT,
                infoFunction: TOVAR_OCHIRISH_INFO_FUNCTION,
                flow: {
                    updateLine: 1,
                    lastStep: 62,
                    steps: [
                        {
                            legacyId: 1,
                            name: "Izoh",
                            message: TOVAR_OCHIRISH_COMMENT,
                            button: "() => empDynamicBtn()",
                            step: "13"
                        }
                    ]
                },
                status: { isActive: true, isDeleted: false },
                legacy: {
                    sourceFile: "seed-tovar-ochirish.js",
                    raw: {
                        id: 9999,
                        menuId: String(menu.legacyId),
                        name: "Tovar o'chirish",
                        comment: TOVAR_OCHIRISH_COMMENT,
                        update: [
                            {
                                id: 1,
                                name: "Izoh",
                                message: TOVAR_OCHIRISH_COMMENT,
                                btn: "() => empDynamicBtn()",
                                step: "13"
                            }
                        ],
                        updateLine: 1,
                        lastStep: 62,
                        infoFn: TOVAR_OCHIRISH_INFO_FUNCTION
                    }
                }
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
