"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mapNameId = (id) => {
    const names = {
        0: {
            name: 'Copyright',
        },
        1: {
            name: 'FontFamily',
        },
        2: {
            name: 'FontSubfamily',
        },
        3: {
            name: 'UniqueSubfamily',
        },
        4: {
            name: 'FullName',
        },
        5: {
            name: 'Version',
        },
        6: {
            name: 'PostScriptName',
        },
        7: {
            name: 'Trademark',
        },
        8: {
            name: 'ManufacturerName',
        },
        9: {
            name: 'DesignerName',
        },
        10: {
            name: 'Description',
        },
        11: {
            name: 'VendorURL',
        },
        12: {
            name: 'DesignerURL',
        },
        13: {
            name: 'LicenseDescription',
        },
        14: {
            name: 'LicenseURL',
        },
        16: {
            name: 'PreferredFamily',
        },
        17: {
            name: 'PreferredSubfamily',
        },
        18: {
            name: 'CompatibleFull',
        },
        19: {
            name: 'SampleText',
        },
        25: {
            name: 'VariationsPostScriptNamePrefix',
        },
    };
    const name = names[id] ?? { name: 'Unknown' };
    if (name)
        name.id = id;
    return name;
};
exports.default = mapNameId;
//# sourceMappingURL=map-name-id.js.map