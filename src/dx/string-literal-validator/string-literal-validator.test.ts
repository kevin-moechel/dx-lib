import { describe, expect, it } from "vitest";

import { safeStringLiteral } from "@/dx/safe-string-literal/safe-string-literal";
import {
    createArrayValidator,
    createSingleValidator,
} from "@/dx/string-literal-validator/string-literal-validator";

const safeLiteralType = safeStringLiteral("a", "b", "c");

describe("createArrayValidator", () => {
    it("should validate and transform an array of strings", () => {
        const validator = createArrayValidator(
            safeLiteralType.values,
            safeLiteralType.toLiterals,
        );
        const result = validator.parse(["a", "b"]);
        expect(result).toEqual(["a", "b"]);
    });

    it("should return an error message if value is not in enum", () => {
        const validator = createArrayValidator(
            safeLiteralType.values,
            safeLiteralType.toLiterals,
        );
        expect(() => validator.parse(["a", "d"])).toThrow("Invalid value");
    });

    it("should throw an error if value is undefined", () => {
        const validator = createArrayValidator(
            safeLiteralType.values,
            safeLiteralType.toLiterals,
        );
        expect(() => validator.parse(undefined)).toThrow();
    });

    it("should throw an error if value is not an array", () => {
        const validator = createArrayValidator(
            safeLiteralType.values,
            safeLiteralType.toLiterals,
        );
        expect(() => validator.parse("a")).toThrow();
    });

    it("should throw an error if value is an empty array", () => {
        const validator = createArrayValidator(
            safeLiteralType.values,
            safeLiteralType.toLiterals,
        );
        expect(() => validator.parse([])).not.toThrow();
    });
});

describe("createSingleValidator", () => {
    it("should validate and transform a single string", () => {
        const validator = createSingleValidator(
            safeLiteralType.values,
            safeLiteralType.toLiteral,
        );
        const result = validator.parse("a");
        expect(result).toEqual("a");
    });

    it("should return an error message if value is not in enum", () => {
        const validator = createSingleValidator(
            safeLiteralType.values,
            safeLiteralType.toLiteral,
        );
        expect(() => validator.parse("d")).toThrow("Invalid value");
    });

    it("should throw an error if value is undefined", () => {
        const validator = createSingleValidator(
            safeLiteralType.values,
            safeLiteralType.toLiteral,
        );

        expect(() => validator.parse(undefined)).toThrow();
    });
});
