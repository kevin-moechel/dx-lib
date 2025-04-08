import { describe, expect, it } from "vitest";

import { safeStringLiteral } from "./safe-string-literal";

describe("safeStringLiteral", () => {
    // Create a test literal type
    const Colors = safeStringLiteral("red", "green", "blue");
    type Color = typeof Colors.type;

    describe("values", () => {
        it("should contain all the provided literal values", () => {
            expect(Colors.values).toEqual(["red", "green", "blue"]);
        });
    });

    describe("isLiteral", () => {
        it("should return true for valid literal values", () => {
            expect(Colors.isLiteral("red")).toBe(true);
            expect(Colors.isLiteral("green")).toBe(true);
            expect(Colors.isLiteral("blue")).toBe(true);
        });

        it("should return false for invalid literal values", () => {
            expect(Colors.isLiteral("yellow")).toBe(false);
            expect(Colors.isLiteral("")).toBe(false);
            expect(Colors.isLiteral("RED")).toBe(false);
        });

        it("should work as a type guard", () => {
            const testColor = (color: string): Color => {
                if (Colors.isLiteral(color)) {
                    // If this compiles, the type guard works
                    return color;
                }
                throw new Error("Invalid color");
            };

            expect(testColor("red")).toBe("red");
            expect(() => testColor("yellow")).toThrow("Invalid color");
        });
    });

    describe("toLiteral", () => {
        it("should return the value for valid literals", () => {
            expect(Colors.toLiteral("red")).toBe("red");
            expect(Colors.toLiteral("green")).toBe("green");
            expect(Colors.toLiteral("blue")).toBe("blue");
        });

        it("should throw an error for invalid literals", () => {
            expect(() => Colors.toLiteral("yellow")).toThrow(
                "Invalid value: yellow"
            );
            expect(() => Colors.toLiteral("")).toThrow("Invalid value: ");
        });
    });

    describe("toLiterals", () => {
        it("should convert an array of valid literals", () => {
            expect(Colors.toLiterals(["red", "blue"])).toEqual(["red", "blue"]);
        });

        it("should throw an error if any value is invalid", () => {
            expect(() => Colors.toLiterals(["red", "yellow"])).toThrow(
                "Invalid value: yellow"
            );
        });

        it("should return an empty array for an empty input", () => {
            expect(Colors.toLiterals([])).toEqual([]);
        });
    });

    describe("edge cases", () => {
        it("should work with a single literal value", () => {
            const SingleValue = safeStringLiteral("only");
            expect(SingleValue.values).toEqual(["only"]);
            expect(SingleValue.isLiteral("only")).toBe(true);
            expect(SingleValue.isLiteral("other")).toBe(false);
        });

        it("should work with empty string literals", () => {
            const WithEmpty = safeStringLiteral("", "non-empty");
            expect(WithEmpty.values).toEqual(["", "non-empty"]);
            expect(WithEmpty.isLiteral("")).toBe(true);
            expect(WithEmpty.toLiteral("")).toBe("");
        });

        it("should handle case sensitivity correctly", () => {
            const CaseSensitive = safeStringLiteral("Value", "value");
            expect(CaseSensitive.values).toEqual(["Value", "value"]);
            expect(CaseSensitive.isLiteral("Value")).toBe(true);
            expect(CaseSensitive.isLiteral("value")).toBe(true);
            expect(CaseSensitive.isLiteral("VALUE")).toBe(false);
        });
    });
});
