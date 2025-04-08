type Success<T> = {
    result: T;
    error: null;
};

type Failure<E> = {
    result: null;
    error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Try-catch wrapper for synchronous functions
 * @param fn - The function to wrap
 * @returns A Result object containing the result or error
 * @example
 * const result = tryCatch(() => {
 *     fs.writeFileSync('file.txt', 'Hello, world!');
 *     return fs.readFileSync('file.txt', 'utf8');
 * });
 * console.log(result); // { result: 'Hello, world!', error: null }
 *
 * const result = tryCatch(() => {
 *     return fs.readFileSync('file-does-not-exist.txt', 'utf8');
 * });
 * console.log(result); // { result: null, error: Error: ENOENT: no such file or directory, open 'file-does-not-exist.txt' }
 */
export function tryCatch<T, E = Error>(fn: () => T): Result<T, E>;

/**
 * Try-catch wrapper for asynchronous functions
 * @param promise - The promise to wrap
 * @returns A Promise containing the Result object
 * @example
 * const result = await tryCatch(fetch('https://api.example.com/data'));
 * console.log(result); // { result: 'Hello, world!', error: null }
 *
 * const result = await tryCatch(fetch('https://api.example.com/data-does-not-exist'));
 * console.log(result); // { result: null, error: Error: 404 }
 */
export function tryCatch<T, E = Error>(
    promise: Promise<T>,
): Promise<Result<T, E>>;

export function tryCatch<T, E = Error>(
    input: Promise<T> | (() => T),
): Result<T, E> | Promise<Result<T, E>> {
    try {
        if (input instanceof Promise) {
            return input
                .then((result) => ({ result, error: null }))
                .catch((error) => ({ result: null, error: error as E }));
        }

        const result = input();
        return { result, error: null };
    } catch (error) {
        return { result: null, error: error as E };
    }
}
