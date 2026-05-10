const { get } = require("lodash");

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

module.exports = { mapToLegacyUser, mapToLegacyPermission };
