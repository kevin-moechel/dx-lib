import { ZodSchema } from "zod";

import { tryCatch } from "@/dx/try-catch/try-catch";

export type ActionFunction<Input, Output, AuthUser> =
    | ActionFunctionNoAuth<Input, Output>
    | ActionFunctionAuth<Input, Output, AuthUser>
    | ActionFunctionAuthNoInput<Output, AuthUser>
    | ActionFunctionNoAuthNoInput<Output>;

type ActionFunctionAuthNoInput<Output, AuthUser> = (
    user: AuthUser,
) => Promise<Output>;

type ActionFunctionNoAuthNoInput<Output> = () => Promise<Output>;

type ActionFunctionAuth<Input, Output, AuthUser> = (
    input: Input,
    user: AuthUser,
) => Promise<Output>;

type ActionFunctionNoAuth<Input, Output> = (input: Input) => Promise<Output>;

/**
 * A function that returns a promise of an authenticated user.
 * This is used to authenticate the user before calling the action.
 *
 * It's expected behaviour that this function redirects the user to an appropriate page if the user is not authenticated.
 *
 * This function is optional. If it is not provided, the action will be unauthenticated.
 */
type AuthFunction<AuthUser> = () => Promise<AuthUser>;

/**
 * The result of an action.
 *
 * This is a union of all possible results of an action.
 *
 * The result either contains a `result` or an `error`. It's not possible to have both.
 */
export type ActionFunctionResult<Input, Output> = {
    result?: Output;
    error?: ActionError<Input>;
};

/**
 * An error that occurs during the execution of an action.
 *
 * This is a union of all possible errors that can occur during the execution of an action.
 *
 * The error either contains a `fieldErrors` object or a `message` string.
 *
 * The `fieldErrors` object is a typesafe represenation of all validation errors of the input to the action as defined by the zod schema.
 *
 * The `message` string is populated by any error that was thrown during the execution of the action. This is a catch all for any error that is not a validation error.
 */
export type ActionError<Input> = {
    fieldErrors?: FieldErrors<Input>;
    message?: string;
};

/**
 * A typesafe representation of all validation errors of the input to the action as defined by the zod schema.
 */
type FieldErrors<T> = {
    [K in keyof T]?: string[];
};

/**
 * A generic wrapper to define server actions in Next.js. Using this function, you can define a server action where the input is automatically validated against a zod schema. Additionally, the action is authenticated and the user is passed to the action.
 *
 * The `auth` function is used to validate the user. It's expected that the function redirects the user if they're not authenticated.
 *
 * The onError function is called if an error occurs during the execution of the action. This is useful for logging errors to e.g. Sentry.
 *
 * @returns A server action that can be called with `FormData` as input from the client.
 * @example
 * ```ts
 * const action = defineValidatedAction({
 *   auth: authFunc, // Provided by your authentication provider or your own function
 *   schema: z.object({ name: z.string() }),
 *   action: async ({ name }, user) => { return name + " - " + user.email },
 *   type: "form",
 * });
 *
 * // Call the action from the client
 * const formData = new FormData();
 * formData.append("name", "John");
 * const actionResponse = await action(formData); // actionResponse.result === "John - john@example.com"
 * ```
 */
export default function defineValidatedAction<Input, Output, AuthUser>(config: {
    schema: ZodSchema<Input>;
    action: ActionFunctionAuth<Input, Output, AuthUser>;
    type: "form";
    auth: AuthFunction<AuthUser>;
    onError?: (error: Error) => void;
}): (input: FormData) => Promise<ActionFunctionResult<Input, Output>>;

/**
 * A generic wrapper to define server actions in Next.js. Using this function, you can define a server action where the input is automatically validated against a zod schema.
 *
 * The onError function is called if an error occurs during the execution of the action. This is useful for logging errors to e.g. Sentry.
 *
 * @returns A server action that can be called with `FormData` as input from the client.
 * @example
 * ```ts
 * const action = defineValidatedAction({
 *   schema: z.object({ name: z.string() }),
 *   action: async ({ name }) => { return name },
 *   type: "form",
 * });
 *
 * // Call the action from the client
 * const formData = new FormData();
 * formData.append("name", "John");
 * const actionResponse = await action(formData); // actionResponse.result === "John"
 * ```
 */
export default function defineValidatedAction<Input, Output>(config: {
    schema: ZodSchema<Input>;
    action: ActionFunctionNoAuth<Input, Output>;
    type: "form";
    onError?: (error: Error) => void;
}): (input: FormData) => Promise<ActionFunctionResult<Input, Output>>;

/**
 * A generic wrapper to define server actions in Next.js. Using this function, you can define a server action where the input is automatically validated against a zod schema. Additionally, the action is authenticated and the user is passed to the action.
 *
 * The `auth` function is used to validate the user. It's expected that the function redirects the user if they're not authenticated.
 *
 * The onError function is called if an error occurs during the execution of the action. This is useful for logging errors to e.g. Sentry.
 *
 * @returns A server action that can be called with a plain object as input from the client.
 * @example
 * ```ts
 * const action = defineValidatedAction({
 *   auth: authFunc, // Provided by your authentication provider or your own function
 *   schema: z.object({ name: z.string() }),
 *   action: async ({ name }, user) => { return name + " - " + user.email },
 *   type: "object",
 * });
 *
 * // Call the action from the client
 * const actionResponse = await action({ name: "John" }); // actionResponse.result === "John - john@example.com"
 * ```
 */
export default function defineValidatedAction<Input, Output, AuthUser>(config: {
    schema: ZodSchema<Input>;
    action: ActionFunctionAuth<Input, Output, AuthUser>;
    type: "object";
    auth: AuthFunction<AuthUser>;
    onError?: (error: Error) => void;
}): (input: Input) => Promise<ActionFunctionResult<Input, Output>>;

/**
 * A generic wrapper to define server actions in Next.js. Using this function, you can define a server action where the input is automatically validated against a zod schema.
 *
 * The onError function is called if an error occurs during the execution of the action. This is useful for logging errors to e.g. Sentry.
 *
 * @returns A server action that can be called with a plain object as input from the client.
 * @example
 * ```ts
 * const action = defineValidatedAction({
 *   schema: z.object({ name: z.string() }),
 *   action: async ({ name }) => { return name },
 *   type: "object",
 * });
 *
 * // Call the action from the client
 * const actionResponse = await action({ name: "John" }); // actionResponse.result === "John"
 * ```
 */
export default function defineValidatedAction<Input, Output>(config: {
    schema: ZodSchema<Input>;
    action: ActionFunctionNoAuth<Input, Output>;
    type: "object";
    onError?: (error: Error) => void;
}): (input: Input) => Promise<ActionFunctionResult<Input, Output>>;

/**
 * A generic wrapper to define server actions in Next.js. Using this function, you can define a server action that requires no input. Additionally, the action is authenticated and the user is passed to the action.
 *
 * The `auth` function is used to validate the user. It's expected that the function redirects the user if they're not authenticated.
 *
 * The onError function is called if an error occurs during the execution of the action. This is useful for logging errors to e.g. Sentry.
 *
 * @returns A server action that can be called with no input from the client.
 * @example
 * ```ts
 * const action = defineValidatedAction({
 *   auth: authFunc, // Provided by your authentication provider or your own function
 *   action: async (user) => { return "Hello " + user.email },
 *   type: "null",
 * });
 *
 * // Call the action from the client
 * const actionResponse = await action(); // actionResponse.result === "Hello john@example.com"
 * ```
 */
export default function defineValidatedAction<Output, AuthUser>(config: {
    action: ActionFunctionAuthNoInput<Output, AuthUser>;
    type: "null";
    auth: AuthFunction<AuthUser>;
    onError?: (error: Error) => void;
}): () => Promise<ActionFunctionResult<void, Output>>;

/**
 * A generic wrapper to define server actions in Next.js. Using this function, you can define a server action that requires no input.
 *
 * The onError function is called if an error occurs during the execution of the action. This is useful for logging errors to e.g. Sentry.
 *
 * @returns A server action that can be called with no input from the client.
 * @example
 * ```ts
 * const action = defineValidatedAction({
 *   action: async () => { return "Hello world!" },
 *   type: "null",
 * });
 *
 * // Call the action from the client
 * const actionResponse = await action(); // actionResponse.result === "Hello world!"
 * ```
 */
export default function defineValidatedAction<Output>(config: {
    action: ActionFunctionNoAuthNoInput<Output>;
    type: "null";
    onError?: (error: Error) => void;
}): () => Promise<ActionFunctionResult<void, Output>>;

/**
 * A function that defines a server action where the input is automatically validated against a zod schema.
 *
 * Based on the type of the action, the function can handle different types of input.
 *
 * - `form`: Handles FormData
 * - `object`: Handles a plain object
 * - `null`: No input is allowed
 *
 * The `auth` function is used to validate the user. It's expected that the function redirects the user if they're not authenticated.
 *
 * The `onError` function is called if an error occurs during the execution of the action. This is useful for logging errors to e.g. Sentry.
 *
 * @returns A server action that can be called with the appropriate input or no input from the client.
 */
export default function defineValidatedAction<Input, Output, AuthUser>({
    schema,
    action,
    type,
    auth,
    onError,
}: {
    schema?: ZodSchema<Input>;
    action: ActionFunction<Input, Output, AuthUser>;
    type: "form" | "object" | "null";
    auth?: AuthFunction<AuthUser>;
    onError?: (error: Error) => void;
}): (input?: Input | FormData) => Promise<ActionFunctionResult<Input, Output>> {
    return async (
        input?: Input | FormData,
    ): Promise<ActionFunctionResult<Input, Output>> => {
        if (type === "form" && input instanceof FormData) {
            // Convert FormData to a plain object
            const formDataInput: Record<string, FormDataEntryValue> = {};
            input.forEach((value, key) => {
                formDataInput[key] = value;
            });
            return execute(
                formDataInput as Input,
                schema!,
                action as
                    | ActionFunctionNoAuth<Input, Output>
                    | ActionFunctionAuth<Input, Output, AuthUser>,
                auth,
                onError,
            );
        } else if (type === "object") {
            return execute(
                input as Input,
                schema!,
                action as
                    | ActionFunctionNoAuth<Input, Output>
                    | ActionFunctionAuth<Input, Output, AuthUser>,
                auth,
                onError,
            );
        } else {
            return executeNoInput(
                action as ActionFunctionNoAuthNoInput<Output>,
                auth,
                onError,
            ) as Promise<ActionFunctionResult<Input, Output>>;
        }
    };
}

async function executeNoInput<Output, AuthUser>(
    action:
        | ActionFunctionNoAuthNoInput<Output>
        | ActionFunctionAuthNoInput<Output, AuthUser>,
    auth?: AuthFunction<AuthUser>,
    onError?: (error: Error) => void,
): Promise<ActionFunctionResult<void, Output>> {
    let result;
    let error;
    if (auth) {
        const user = await auth();
        const { result: res, error: asyncError } = await tryCatch(
            (action as ActionFunctionAuthNoInput<Output, AuthUser>)(user),
        );
        result = res;
        error = asyncError;
    } else {
        const { result: res, error: asyncError } = await tryCatch(
            (action as ActionFunctionNoAuth<void, Output>)(undefined),
        );
        result = res;
        error = asyncError;
    }

    return handleActionResponse(result as Output, error, onError);
}

async function execute<Input, Output, AuthUser>(
    input: Input,
    schema: ZodSchema<Input>,
    action:
        | ActionFunctionNoAuth<Input, Output>
        | ActionFunctionAuth<Input, Output, AuthUser>,
    auth?: AuthFunction<AuthUser>,
    onError?: (error: Error) => void,
): Promise<ActionFunctionResult<Input, Output>> {
    const parsedInput = schema.safeParse(input);

    if (parsedInput.success) {
        let result;
        let error;
        if (auth) {
            const user = await auth();
            const { result: res, error: asyncError } = await tryCatch(
                action(parsedInput.data, user),
            );
            result = res;
            error = asyncError;
        } else {
            const { result: res, error: asyncError } = await tryCatch(
                (action as ActionFunctionNoAuth<Input, Output>)(
                    parsedInput.data,
                ),
            );
            result = res;
            error = asyncError;
        }

        return handleActionResponse(result as Output, error, onError);
    }

    return {
        error: { fieldErrors: parsedInput.error.flatten().fieldErrors },
        result: undefined,
    } as ActionFunctionResult<Input, Output>;
}

function handleActionResponse<Input, Output>(
    res: Output | undefined,
    error: Error | null,
    onError?: (error: Error) => void,
): ActionFunctionResult<Input, Output> {
    if (error) {
        // Rethrow NEXT_REDIRECT errors to be handled by the Next.js router.
        // This is a special case where the action results is a redirect.
        if (error.message.includes("NEXT_REDIRECT")) {
            throw error;
        }

        // If an error handler is provided, call it.
        if (onError) {
            onError(error);
        }

        return {
            error: { message: error.message },
            result: undefined,
        };
    }

    return {
        error: undefined,
        result: res,
    };
}
