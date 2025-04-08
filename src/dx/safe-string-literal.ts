type safeStringLiteral<T extends readonly string[]> = {
    values: T;
    type: T[number];
    toLiteral: (value: string) => T[number];
    toLiterals: (values: string[]) => T[number][];
    isLiteral: (value: string) => value is T[number];
};

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
