import { describe, expect, it } from "vitest";

import defineDataAccessFunction from "@/dx/define-data-access-function/define-data-access-function";

type User = {
    id: string;
};

const mockUser = { id: "user-id" } as User;
function auth(): Promise<User> {
    return Promise.resolve(mockUser);
}

function unauth(): Promise<User> {
    throw new Error("User is not authenticated");
}

describe("defineDataAccessFunction", () => {
    describe("when requiresAuth is false", () => {
        it("should call the function without user", async () => {
            const getData = defineDataAccessFunction({
                func: async (param1: string, param2: number) => {
                    return `Result: ${param1}, ${param2}`;
                },
            });

            const { result, error } = await getData("test", 42);

            expect(result).toBe("Result: test, 42");
            expect(error).toBeNull();
        });

        it("returns an error if the function throws an error", async () => {
            const getData = defineDataAccessFunction({
                func: async (param: string) => {
                    throw new Error(`Function failed with param ${param}`);
                },
            });

            const { result, error } = await getData("test");

            expect(result).toBeNull();
            expect(error).toEqual(new Error("Function failed with param test"));
        });
    });

    describe("when auth is required", () => {
        it("returns an Error if user is not authenticated", async () => {
            const getData = defineDataAccessFunction({
                auth: unauth,
                func: async () => {
                    throw new Error("Will not be called");
                },
            });
            await expect(getData()).rejects.toThrow(
                "User is not authenticated",
            );
        });

        it("should return an error if the function throws an error after auth succeeds", async () => {
            const getData = defineDataAccessFunction({
                auth: auth,
                func: async (user: User, param: string) => {
                    throw new Error(
                        `Failed processing for user ${user.id} with param ${param}`,
                    );
                },
            });

            const { result, error } = await getData("test");
            expect(result).toBeNull();
            expect(error).toEqual(
                new Error("Failed processing for user user-id with param test"),
            );
        });

        it("should call the function with only the user when no parameters are passed", async () => {
            const getData = defineDataAccessFunction({
                auth: auth,
                func: async (user: User) => {
                    return `User ID: ${user.id}`;
                },
            });

            const { result, error } = await getData();

            expect(result).toBe("User ID: user-id");
            expect(error).toBeNull();
        });

        it("should call the function with params", async () => {
            const getData = defineDataAccessFunction({
                auth: auth,
                func: async (_user: User, param1: string, param2: number) => {
                    return `Result: ${param1}, ${param2}`;
                },
            });

            const { result, error } = await getData("test", 42);

            expect(result).toBe("Result: test, 42");
            expect(error).toBeNull();
        });
    });
});
