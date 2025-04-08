/**
 * Type definition for a safe string literal type.
 *
 * @template T - The array of strings to create a safe string literal type from.
 */
type safeStringLiteral<T extends readonly string[]> = {
    /**
     * The array of strings that define the string literal type.
     */
    values: T;
    /**
     * The typescript type for the string literal.
     */
    type: T[number];
    /**
     * Converts a string to the string literal type.
     */
    toLiteral: (value: string) => T[number];
    /**
     * Converts an array of strings to the string literal type.
     */
    toLiterals: (values: string[]) => T[number][];
    /**
     * Checks if a string is of the literal type.
     */
    isLiteral: (value: string) => value is T[number];
};

/**
 * Creates a string literal type from an array of strings including helper functions to ensure type safety.
 * Use this function if you want to
 * 1. iterate on the values of the literal type, but still have type safety.
 * 2. convert strings to the literal type in a type-safe way.
 * 3. ensure that strings are actually valid values of the literal type.
 *
 * This is a common use case when you get values from a 3rd party library and you want to ensure that it is an expected value.
 *
 * This helper replaces code like this:
 * ```typescript
 * const Colors = ["red", "green", "blue"] as const;
 * type Color = typeof Colors[number];
 * ```
 *
 * With code like this:
 * ```typescript
 * const Colors = safeStringLiteral("red", "green", "blue");
 * type Color = typeof Colors.type;
 * ```
 *
 * Don't use this function if you want to create a simple string literal type that you fully control on your own with no outside dependencies.
 *
 * @param args - The array of strings to create a safe string literal type from.
 * @returns A string literal type with helper functions to ensure type safety.
 * @example
 * const Colors = safeStringLiteral("red", "green", "blue");
 * const colorValues = Colors.values; // ["red", "green", "blue"]
 * type Color = typeof Colors.type; // "red" | "green" | "blue"
 * const color: Colors.type = "red";
 * const invalidColor: Colors.type = "yellow"; // Error: Type '"yellow"' is not assignable to type '"red" | "green" | "blue"'.
 *
 * const literal = Colors.toLiteral("red"); // "red"
 * const invalidLiteral = Colors.toLiteral("yellow"); // Error: Invalid value: yellow.
 * const literals = Colors.toLiterals(["red", "yellow"]); // Error: Invalid value: yellow.
 * const isLiteral = Colors.isLiteral("red"); // true
 * const isInvalidLiteral = Colors.isLiteral("yellow"); // false
 *
 */
export function safeStringLiteral<const T extends readonly string[]>(
    ...args: T
): safeStringLiteral<T> {
    const arr = args;
    type Value = T[number];

    function toLiteral(value: string): Value {
        if (!isLiteral(value)) {
            throw new Error(`Invalid value: ${value}`);
        }
        return value as Value;
    }

    function toLiterals(values: string[]): Value[] {
        return values.map(toLiteral);
    }

    function isLiteral(value: string): value is Value {
        return (arr as readonly string[]).includes(value);
    }

    return {
        values: arr,
        type: null as unknown as Value,
        toLiteral,
        toLiterals,
        isLiteral,
    } as safeStringLiteral<T>;
}
