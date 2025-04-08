"use client";

import { useActionState } from "react";

/**
 * This is a wrapper hook for the `useActionState` hook from React.
 * It omits the state parameter for DX purposes  and is designed to be used with the `defineValidatedAction` function.
 *
 * @param definedAction - The server action that should be used with this hook.
 * @returns An array with the result of the server action after execution, the executable function for the client code and the the loading state.
 * @example
 * ```ts
 * // server-action.ts
 * export const validatedAction = defineValidatedAction({
 *   type: "form",
 *   schema: z.object({
 *     name: z.string(),
 *   }),
 *   action: async (input: Input) => {
 *     // ...
 *   },
 * });
 *
 * // client-component.tsx
 * const [result, action, isLoading] = useValidatedActionState(validatedAction);
 *
 * // client-component.tsx
 * <form action={action}>
 *  <input type="text" name="name" />
 *  <button type="submit" disabled={isLoading}>{isLoading ? "Submitting..." : "Submit"}</button>
 * </form>
 * ```
 */
export function useValidatedActionState<Input = void, Output = unknown>(
    definedAction: (input: Input) => Output,
) {
    return useActionState(
        (_state: unknown, payload: Input) => definedAction(payload),
        null,
    );
}
