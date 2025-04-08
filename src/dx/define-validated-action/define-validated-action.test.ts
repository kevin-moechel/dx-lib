import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import defineValidatedAction from "./define-validated-action";

describe("defineValidatedAction", () => {
    type User = { id: string; email: string };
    const mockUser = { id: "1", email: "test@mail.com" } as User;
    const authFunc = function () {
        return Promise.resolve(mockUser);
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return errors during action invocation", async () => {
        const definedAction = defineValidatedAction({
            type: "object",
            schema: z.object({
                test: z.string(),
            }),
            action: async () => {
                throw new Error("Unexpected error");
            },
        });

        const res = await definedAction({ test: "value" });
        expect(res.error).toBeDefined();
        expect(res.result).toBeUndefined();
        expect(res.error!.fieldErrors).toBeUndefined();
        expect(res.error!.message).toBe("Unexpected error");
    });

    it("should return validation errors", async () => {
        const definedAction = defineValidatedAction({
            type: "object",
            schema: z.object({
                test: z.string().min(10, { message: "Requires 10 chars" }),
            }),
            action: async ({ test }) => {
                return test;
            },
        });

        const res = await definedAction({ test: "too short" });
        expect(res.error).toBeDefined();
        expect(res.error!.message).toBeUndefined();
        expect(res.error!.fieldErrors?.test).toBeDefined();
        expect(res.error!.fieldErrors?.test).toHaveLength(1);
        expect(res.error!.fieldErrors?.test![0]).toBe("Requires 10 chars");
    });

    it("should call the onError function if an error occurs", async () => {
        const onError = vi.fn();
        const definedAction = defineValidatedAction({
            type: "object",
            schema: z.object({ test: z.string() }),
            action: async () => {
                throw new Error("Unexpected error");
            },
            onError,
        });

        await definedAction({ test: "value" });
        expect(onError).toHaveBeenCalledWith(new Error("Unexpected error"));
    });

    it("should return the expected result", async () => {
        const definedAction = defineValidatedAction({
            type: "object",
            schema: z.object({
                test: z.string(),
            }),
            action: async ({ test }) => {
                return test;
            },
        });

        const res = await definedAction({ test: "value" });
        expect(res.result).toBeDefined();
        expect(res.result).toBe("value");
    });

    describe("with form input", () => {
        it("should require a formData object as input", async () => {
            const definedAction = defineValidatedAction({
                type: "form",
                schema: z.object({
                    test: z.string(),
                }),
                action: async (input) => {
                    return input.test;
                },
            });

            const formData = new FormData();
            formData.append("test", "value");

            const res = await definedAction(formData);
            expect(res.result).toBeDefined();
            expect(res.error).toBeUndefined();
            expect(res.result).toBe("value");
        });

        it("should validate the formData", async () => {
            const definedAction = defineValidatedAction({
                type: "form",
                schema: z.object({
                    test: z.number({ message: "Requires a number" }),
                }),
                action: async () => {
                    throw new Error("Unexpected error");
                },
            });

            const formData = new FormData();
            formData.append("test", "value");

            const res = await definedAction(formData);
            expect(res.error).toBeDefined();
            expect(res.error!.message).toBeUndefined();
            expect(res.error!.fieldErrors?.test).toBeDefined();
            expect(res.error!.fieldErrors?.test).toHaveLength(1);
            expect(res.error!.fieldErrors?.test![0]).toBe("Requires a number");
        });
    });

    describe("with no input", () => {
        it("should return the expected result", async () => {
            const definedAction = defineValidatedAction({
                type: "null",
                action: async () => {
                    return "value";
                },
            });

            const res = await definedAction();
            expect(res.result).toBeDefined();
            expect(res.error).toBeUndefined();
            expect(res.result).toBe("value");
        });
    });

    describe("with authenticated required", () => {
        it("should provide the expected user", async () => {
            const definedAction = defineValidatedAction({
                auth: authFunc,
                type: "null",
                action: async (user: User) => {
                    return user;
                },
            });

            const res = await definedAction();
            expect(res.result).toBeDefined();
            expect(res.result).toBe(mockUser);
        });

        it("should take input params", async () => {
            const definedAction = defineValidatedAction({
                auth: authFunc,
                type: "object",
                schema: z.object({
                    test: z.string(),
                }),
                action: async (input, user) => {
                    return input.test + user.email;
                },
            });

            const res = await definedAction({ test: "value" });
            expect(res.result).toBeDefined();
            expect(res.error).toBeUndefined();
            expect(res.result).toBe("value" + mockUser.email);
        });

        it("should throw an error if getting the user fails", async () => {
            const unauthenticatedFunction = function () {
                return Promise.reject(new Error("NEXT_REDIRECT"));
            };

            const definedAction = defineValidatedAction({
                auth: unauthenticatedFunction,
                type: "null",
                action: async () => {},
            });

            await expect(definedAction()).rejects.toThrow("NEXT_REDIRECT");
        });
    });
});
