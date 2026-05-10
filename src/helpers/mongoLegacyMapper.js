const { get } = require("lodash");
const mongoose = require("mongoose");

function toFiniteNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
}

function toDate(value) {
    if (!value) return undefined;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

function toDecimal(value) {
    if (value === undefined || value === null || value === "") return undefined;
    const normalized = String(value).replace(/\s+/g, "").replace(",", ".");
    const n = Number(normalized);
    return Number.isFinite(n) ? mongoose.Types.Decimal128.fromString(String(n)) : undefined;
}

function decimalToString(value, fallback) {
    if (value === undefined || value === null) return fallback;
    return typeof value.toString === "function" ? value.toString() : String(value);
}

function cleanUndefined(value) {
    if (Array.isArray(value)) {
        return value.map(cleanUndefined).filter((item) => item !== undefined);
    }

    if (!value || typeof value !== "object" || value instanceof Date || value._bsontype) {
        return value;
    }

    return Object.entries(value).reduce((acc, [key, item]) => {
        const cleaned = cleanUndefined(item);
        if (cleaned !== undefined) acc[key] = cleaned;
        return acc;
    }, {});
}

/**
 * Maps a MongoDB User and BotState to the legacy user.json structure.
 */
function mapToLegacyUser(mongoUser, mongoBotState) {
    if (!mongoUser) return null;

    // Use legacy.raw as base if available to preserve unstructured fields
    const legacyBase = get(mongoUser, 'legacy.raw', {});

    const mapped = {
        ...legacyBase,
        EmployeeID: get(mongoUser, 'employee.employeeId', legacyBase.EmployeeID),
        FirstName: get(mongoUser, 'employee.firstName', legacyBase.FirstName),
        LastName: get(mongoUser, 'employee.lastName', legacyBase.LastName),
        MobilePhone: get(mongoUser, 'employee.mobilePhone', legacyBase.MobilePhone),
        JobTitle: get(mongoUser, 'employee.jobTitle', legacyBase.JobTitle),
        SalesPersonCode: get(mongoUser, 'employee.salesPersonCode', legacyBase.SalesPersonCode),
        chat_id: get(mongoUser, 'telegram.chatId', legacyBase.chat_id),
        is_active: get(mongoUser, 'status.isActive', legacyBase.is_active),
        isAdmin: get(mongoUser, 'role.isAdmin', legacyBase.isAdmin),
        adminType: get(mongoUser, 'role.adminType', legacyBase.adminType),
        
        // State fields from BotState (the primary source for state now)
        user_step: get(mongoBotState, 'current.step', legacyBase.user_step || 1),
        back: get(mongoBotState, 'navigation.backStack', legacyBase.back || []).map(b => ({
            step: b.step,
            text: b.text,
            btn: b.buttonSnapshot
        })),
        currentUserRole: get(mongoBotState, 'current.role', legacyBase.currentUserRole),
        currentDataId: get(mongoBotState, 'current.dataId', legacyBase.currentDataId),
        lastMessageId: get(mongoBotState, 'lastMessage.messageId', legacyBase.lastMessageId),
        
        // Flags
        update: get(mongoBotState, 'flags.update', legacyBase.update || false),
        waitingUpdateStatus: get(mongoBotState, 'flags.waitingUpdateStatus', legacyBase.waitingUpdateStatus || false),
        extraWaiting: get(mongoBotState, 'flags.extraWaiting', legacyBase.extraWaiting || false),
        
        // Admin fields
        selectedAdminUserChatId: get(mongoBotState, 'adminFlow.selectedAdminUserChatId', legacyBase.selectedAdminUserChatId),
        selectedAdminUserStatus: get(mongoBotState, 'adminFlow.selectedAdminUserStatus', legacyBase.selectedAdminUserStatus),
        
        // MongoDB internal IDs for later updates
        _mongoUserId: mongoUser._id,
        _mongoBotStateId: mongoBotState ? mongoBotState._id : null
    };

    return mapped;
}

/**
 * Maps MongoDB Permissions to the legacy permisson.json structure.
 */
function mapToLegacyPermission(mongoPermissions, chatId) {
    if (!mongoPermissions || !mongoPermissions.length) {
        return { chat_id: chatId, roles: [], permissonMenuEmp: {}, permissonMenuAffirmative: {}, permissonMenuExecutor: {} };
    }

    const legacyPermission = {
        chat_id: chatId,
        roles: [],
        permissonMenuEmp: {},
        permissonMenuAffirmative: {},
        permissonMenuExecutor: {}
    };

    mongoPermissions.forEach(p => {
        if (get(p, 'legacy.rawKey') === 'empty_permission') {
            const raw = get(p, 'legacy.raw', {});
            legacyPermission.roles = raw.roles || legacyPermission.roles;
            return;
        }

        const typeMap = {
            'employee': 'permissonMenuEmp',
            'affirmative': 'permissonMenuAffirmative',
            'executor': 'permissonMenuExecutor'
        };

        const legacyField = typeMap[p.permissionType];
        if (legacyField && p.scope.legacyMenuId) {
            legacyPermission[legacyField][p.scope.legacyMenuId] = p.scope.subMenuIds || [];
        }

        // Collect roles (1=Emp, 2=Affirmative, 3=Executor)
        if (p.permissionType === 'employee' && !legacyPermission.roles.includes("1")) legacyPermission.roles.push("1");
        if (p.permissionType === 'affirmative' && !legacyPermission.roles.includes("2")) legacyPermission.roles.push("2");
        if (p.permissionType === 'executor' && !legacyPermission.roles.includes("3")) legacyPermission.roles.push("3");
    });

    return legacyPermission;
}

function mapLegacyPermissionToMongoList(legacyPermission) {
    const chatId = Number(legacyPermission && legacyPermission.chat_id);
    if (!Number.isFinite(chatId)) return [];

    const typeMap = [
        { legacyKey: "permissonMenuEmp", permissionType: "employee", actions: { view: true, create: true } },
        { legacyKey: "permissonMenuAffirmative", permissionType: "affirmative", actions: { view: true, confirm: true } },
        { legacyKey: "permissonMenuExecutor", permissionType: "executor", actions: { view: true, execute: true, update: true } }
    ];

    const permissions = [];

    typeMap.forEach(({ legacyKey, permissionType, actions }) => {
        const menus = legacyPermission[legacyKey] || {};
        Object.entries(menus).forEach(([legacyMenuId, subMenuIds]) => {
            permissions.push({
                subject: { type: "user", chatId },
                scope: {
                    legacyMenuId: String(legacyMenuId),
                    subMenuIds: Array.isArray(subMenuIds) ? subMenuIds.map(String) : []
                },
                permissionType,
                actions,
                status: { isActive: true },
                legacy: {
                    rawKey: legacyKey,
                    raw: legacyPermission
                }
            });
        });
    });

    if (!permissions.length) {
        permissions.push({
            subject: { type: "user", chatId },
            scope: {
                legacyMenuId: "__none__",
                subMenuIds: []
            },
            permissionType: "employee",
            actions: {
                view: false,
                create: false,
                update: false,
                delete: false,
                confirm: false,
                execute: false
            },
            status: { isActive: true },
            legacy: {
                rawKey: "empty_permission",
                raw: legacyPermission
            }
        });
    }

    return permissions;
}

function mapLegacyRequestToMongo(row) {
    if (!row || typeof row !== "object") return null;

    const requestNo = toFiniteNumber(row.ID ?? row.requestNo);
    const publicId = row.id != null ? String(row.id) : (row.publicId != null ? String(row.publicId) : undefined);
    const createdAt = toDate(row.creationDate || get(row, "stateTime.create"));
    const updatedAt = toDate(row.updatedAt || row.updateDate);

    const documentFile = get(row, "file.document") || get(row, "lastFile.file");
    const files = documentFile ? [{
        fileId: documentFile.file_id,
        fileUniqueId: documentFile.file_unique_id,
        fileName: documentFile.file_name,
        mimeType: documentFile.mime_type,
        size: documentFile.file_size,
        thumbnail: documentFile.thumbnail ? {
            fileId: documentFile.thumbnail.file_id,
            fileUniqueId: documentFile.thumbnail.file_unique_id,
            size: documentFile.thumbnail.file_size,
            width: documentFile.thumbnail.width,
            height: documentFile.thumbnail.height
        } : undefined,
        isActive: get(row, "file.active", true),
        isSent: get(row, "file.send", false)
    }] : [];

    return cleanUndefined({
        requestNo,
        publicId,
        type: row.payment ? "payment" : row.purchase ? "purchase" : row.ticket ? "ticket" : "generic",
        source: "telegram_bot",
        creator: {
            chatId: toFiniteNumber(row.chat_id)
        },
        menu: {
            legacyMenuId: toFiniteNumber(row.menu),
            menuName: row.menuName,
            legacySubMenuId: row.subMenuId != null ? String(row.subMenuId) : undefined,
            subMenuName: row.subMenu
        },
        financial: {
            isPayment: Boolean(row.payment),
            isPurchase: Boolean(row.purchase),
            amount: toDecimal(row.summa),
            rawAmount: row.summa != null ? String(row.summa) : undefined,
            currency: row.currency,
            currencyRate: toDecimal(row.currencyRate),
            rawCurrencyRate: row.currencyRate != null ? String(row.currencyRate) : undefined,
            payType: row.payType,
            accountType: row.accountType,
            point: row.point,
            startDate: toDate(row.startDate),
            endDate: toDate(row.endDate),
            documentType: row.documentType
        },
        accounts: {
            accountCode: row.accountCode,
            accountCodeOther: row.accountCodeOther,
            selectedAccounts: [...(row.accountList || []), ...(row.accountList43 || []), ...(row.accountList50 || [])].map((item) => ({
                legacyId: item.id != null ? String(item.id) : undefined,
                name: item.name || item.AcctName,
                num: toFiniteNumber(item.num),
                source: item.source
            })),
            dds: {
                code: get(row, "dds.code"),
                list: Array.isArray(get(row, "dds.list")) ? row.dds.list.map((item) => ({
                    legacyId: item.id != null ? String(item.id) : undefined,
                    name: item.name
                })) : undefined
            }
        },
        vendor: {
            vendorId: row.vendorId,
            selectedVendors: Array.isArray(row.vendorList) ? row.vendorList.map((item) => ({
                legacyId: item.id != null ? String(item.id) : undefined,
                name: item.name || item.CardName,
                num: toFiniteNumber(item.num)
            })) : undefined
        },
        customer: {
            customerId: row.customerId,
            customerCode: row.customerCode,
            customerName: row.customerName,
            selectedCustomers: Array.isArray(row.customerList) ? row.customerList.map((item) => ({
                legacyId: item.id != null ? String(item.id) : undefined,
                name: item.name,
                customerName: item.customerName || item.CardName,
                num: toFiniteNumber(item.num)
            })) : undefined
        },
        workflow: {
            isFull: Boolean(row.full),
            isDeleted: Boolean(row.is_delete),
            confirmative: {
                chatId: toFiniteNumber(get(row, "confirmative.chat_id")),
                status: Boolean(get(row, "confirmative.status")),
                date: toDate(get(row, "stateTime.confirmative.date"))
            },
            executor: {
                chatId: toFiniteNumber(get(row, "executor.chat_id")),
                status: Boolean(get(row, "executor.status")),
                date: toDate(get(row, "stateTime.executor.date"))
            },
            confirmativeSendList: Array.isArray(row.confirmativeSendlist) ? row.confirmativeSendlist.map((item) => ({
                chatId: toFiniteNumber(item.chatId),
                messageId: toFiniteNumber(item.messageId)
            })) : undefined
        },
        sap: {
            enabled: Boolean(row.sap),
            sapB1: Boolean(row.sapB1),
            jira: Boolean(row.jira),
            jiraMessage: row.SapJiraMessage,
            errorMessage: row.sapErrorMessage
        },
        ticket: {
            ticketNo: row.ticket,
            isAdded: Boolean(row.ticketAdd),
            status: {
                comment: row.ticketStatusObj
            }
        },
        purchaseOrder: {
            purchaseEntry: row.purchaseEntry,
            orders: Array.isArray(row.orderList) ? row.orderList.map((item) => ({
                docEntry: toFiniteNumber(item.DocEntry),
                docNum: toFiniteNumber(item.DocNum),
                docStatus: item.DocStatus,
                docType: item.DocType,
                cardCode: item.CardCode,
                cardName: item.CardName,
                currency: item.Currency,
                itemCode: item.ItemCode,
                lineNum: toFiniteNumber(item.LineNum),
                numAtCard: item.NumAtCard,
                price: toDecimal(item.Price),
                quantity: toDecimal(item.Quantity),
                rate: toDecimal(item.Rate),
                canceled: item.CANCELED,
                raw: item
            })) : undefined
        },
        files,
        comment: row.comment,
        notConfirmMessage: row.notConfirmMessage,
        timestamps: {
            createdAt,
            updatedAt,
            confirmativeAt: toDate(get(row, "stateTime.confirmative.date")),
            executorAt: toDate(get(row, "stateTime.executor.date"))
        },
        legacy: {
            rawId: publicId,
            rawID: requestNo,
            raw: row
        }
    });
}

function mapToLegacyRequest(mongoRequest) {
    if (!mongoRequest) return null;
    const doc = typeof mongoRequest.toObject === "function" ? mongoRequest.toObject() : mongoRequest;
    const legacyBase = get(doc, "legacy.raw", {});

    return {
        ...legacyBase,
        id: doc.publicId || legacyBase.id,
        ID: doc.requestNo || legacyBase.ID,
        menu: get(doc, "menu.legacyMenuId", legacyBase.menu),
        menuName: get(doc, "menu.menuName", legacyBase.menuName),
        subMenu: get(doc, "menu.subMenuName", legacyBase.subMenu),
        subMenuId: get(doc, "menu.legacySubMenuId", legacyBase.subMenuId),
        chat_id: get(doc, "creator.chatId", legacyBase.chat_id),
        creationDate: get(doc, "timestamps.createdAt", legacyBase.creationDate),
        full: get(doc, "workflow.isFull", legacyBase.full),
        is_delete: get(doc, "workflow.isDeleted", legacyBase.is_delete),
        summa: decimalToString(get(doc, "financial.amount"), legacyBase.summa),
        currencyRate: decimalToString(get(doc, "financial.currencyRate"), legacyBase.currencyRate),
        currency: get(doc, "financial.currency", legacyBase.currency),
        comment: doc.comment || legacyBase.comment,
        notConfirmMessage: doc.notConfirmMessage || legacyBase.notConfirmMessage,
        confirmative: {
            ...legacyBase.confirmative,
            chat_id: get(doc, "workflow.confirmative.chatId", get(legacyBase, "confirmative.chat_id")),
            status: get(doc, "workflow.confirmative.status", get(legacyBase, "confirmative.status"))
        },
        executor: {
            ...legacyBase.executor,
            chat_id: get(doc, "workflow.executor.chatId", get(legacyBase, "executor.chat_id")),
            status: get(doc, "workflow.executor.status", get(legacyBase, "executor.status"))
        },
        stateTime: {
            ...legacyBase.stateTime,
            create: get(doc, "timestamps.createdAt", get(legacyBase, "stateTime.create")),
            confirmative: {
                ...get(legacyBase, "stateTime.confirmative", {}),
                status: get(doc, "workflow.confirmative.status", get(legacyBase, "stateTime.confirmative.status")),
                date: get(doc, "workflow.confirmative.date", get(legacyBase, "stateTime.confirmative.date"))
            },
            executor: {
                ...get(legacyBase, "stateTime.executor", {}),
                status: get(doc, "workflow.executor.status", get(legacyBase, "stateTime.executor.status")),
                date: get(doc, "workflow.executor.date", get(legacyBase, "stateTime.executor.date"))
            }
        }
    };
}

module.exports = {
    mapToLegacyUser,
    mapToLegacyPermission,
    mapLegacyPermissionToMongoList,
    mapLegacyRequestToMongo,
    mapToLegacyRequest
};
