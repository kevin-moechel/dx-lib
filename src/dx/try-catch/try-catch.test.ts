import { describe, expect, it } from "vitest";

import { tryCatch } from "./try-catch";

describe("tryCatch", () => {
    describe("synchronous", () => {
        it("should return data on success", () => {
            const result = tryCatch(() => 42);
            expect(result).toEqual({ result: 42, error: null });
        });

        it("should return error on failure", () => {
            const error = new Error("test error");
            const result = tryCatch(() => {
                throw error;
            });
            expect(result).toEqual({ result: null, error });
        });

        it("should handle custom error types", () => {
            class CustomError extends Error {
                constructor(public code: number) {
                    super("Custom error");
                }
            }

            const error = new CustomError(400);
            const result = tryCatch<number, CustomError>(() => {
                throw error;
            });

            expect(result.error).toBeInstanceOf(CustomError);
            expect(result.error?.code).toBe(400);
        });
    });

    describe("asynchronous", () => {
        it("should return data on success", async () => {
            const result = await tryCatch(Promise.resolve(42));
            expect(result).toEqual({ result: 42, error: null });
        });

        it("should return error on rejection", async () => {
            const error = new Error("test error");
            const result = await tryCatch(Promise.reject(error));
            expect(result).toEqual({ result: null, error });
        });

        it("should handle custom error types", async () => {
            class CustomError extends Error {
                constructor(public code: number) {
                    super("Custom error");
                }
            }

            const error = new CustomError(500);
            const result = await tryCatch<number, CustomError>(
                Promise.reject(error),
            );

            expect(result.error).toBeInstanceOf(CustomError);
            expect(result.error?.code).toBe(500);
        });

        it("should handle errors thrown in async functions", async () => {
            const error = new Error("async error");
            const asyncFn = async () => {
                throw error;
            };

            const result = await tryCatch(asyncFn());
            expect(result).toEqual({ result: null, error });
        });
    });
});
