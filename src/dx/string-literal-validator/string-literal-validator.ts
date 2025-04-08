import { z } from "zod";

/**
 * Creates a zod validator for an array of strings to a literal type.
 *
 * @param values - The array of allowed input strings.
 * @param transform - The function used to transform the array of strings to the desired type.
 * @returns A zod validator that validates an array of strings and transforms them to the desired type.
 * By default the validator will throw an error if the input is not an array.
 * However, it doesn't throw an error if the input is an empty array.
 */
export function createArrayValidator<T extends string, U>(
    values: readonly [T, ...T[]],
    transform: (values: T[]) => U[],
) {
    return z
        .array(z.enum(values, { message: "Invalid value" }))
        .transform(transform);
}

/**
 * Creates a zod validator for a single string to a literal type.
 *
 * @param values - The array of allowed input strings.
 * @param transform - The function used to transform the string to the desired type.
 * @returns A zod validator that validates a single string and transforms it to the desired type.
 */
export function createSingleValidator<T extends string, U>(
    values: readonly [T, ...T[]],
    transform: (value: T) => U,
) {
    return z.enum(values, { message: "Invalid value" }).transform(transform);
}
