"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = (condition, message = 'Assertion Failed') => {
    if (!condition)
        throw new Error(message);
    return true;
};
exports.default = assert;
//# sourceMappingURL=assert.js.map