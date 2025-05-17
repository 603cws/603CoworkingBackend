"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createuserInputs = exports.loginInputs = void 0;
const zod_1 = require("zod");
exports.loginInputs = zod_1.z.object({
    usernameOrEmail: zod_1.z.string().nonempty('Username or email is required'),
    password: zod_1.z.string().nonempty('Password is required'),
});
exports.createuserInputs = zod_1.z.object({
    companyName: zod_1.z.string().optional(),
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
    phone: zod_1.z.string().optional(),
    username: zod_1.z.string().nonempty('Username is required'),
    country: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    zipcode: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    monthlycredits: zod_1.z.number().optional(),
    extracredits: zod_1.z.number().optional(),
    creditsleft: zod_1.z.number().optional(),
    member: zod_1.z.boolean().optional(),
});
