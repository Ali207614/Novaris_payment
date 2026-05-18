const test = require('node:test');
const assert = require('node:assert/strict');
const {
    findSubMenuForRequest,
    getSubMenuIdForRequest
} = require('../src/helpers/subMenuResolver');

test('submenu resolver prefers stored submenu id over duplicate names', () => {
    const subMenus = {
        6: [
            { id: 1, name: "Tovar o'chirish", source: 'static' },
            { id: 9999, name: "Tovar o'chirish", source: 'dynamic' }
        ]
    };

    const resolved = findSubMenuForRequest(subMenus, {
        menu: 6,
        subMenu: "Tovar o'chirish",
        subMenuId: 9999
    });

    assert.equal(resolved.source, 'dynamic');
    assert.equal(getSubMenuIdForRequest(subMenus, { menu: 6, subMenuId: 9999 }), 9999);
});

test('submenu resolver falls back to name when id is absent', () => {
    const subMenus = {
        6: [
            { id: 1, name: "Tovar o'chirish", source: 'static' },
            { id: 9999, name: "Tovar o'chirish", source: 'dynamic' }
        ]
    };

    const resolved = findSubMenuForRequest(subMenus, {
        menu: 6,
        subMenu: "Tovar o'chirish"
    });

    assert.equal(resolved.source, 'static');
});

test('submenu resolver supports legacy submenu ids', () => {
    const subMenus = {
        8: [
            { id: 1, legacyId: 42, name: 'Legacy submenu' }
        ]
    };

    const resolved = findSubMenuForRequest(subMenus, {
        menu: 8,
        subMenu: 'Renamed submenu',
        legacySubMenuId: '42'
    });

    assert.equal(resolved.name, 'Legacy submenu');
});
