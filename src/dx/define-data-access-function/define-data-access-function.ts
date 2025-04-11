import { Result, tryCatch } from "@/dx/try-catch/try-catch";

type DALResult<Output> =
    | { result: Output; error: null }
    | { result: null; error: Error };

type AuthFunction<AuthUser> = () => Promise<AuthUser>;

type DALDefinitionAuth<Params extends unknown[], Output, AuthUser> = (
    user: AuthUser,
    ...params: Params
) => Promise<Output>;

type DALDefinitionNoAuth<Params extends unknown[], Output> = (
    ...params: Params
) => Promise<Output>;

export default function defineDataAccessFunction<
    Params extends unknown[],
    Output,
    AuthUser,
>(config: {
    auth: AuthFunction<AuthUser>;
    func: DALDefinitionAuth<Params, Output, AuthUser>;
}): (...params: Params) => Promise<DALResult<Output>>;

export default function defineDataAccessFunction<
    Params extends unknown[],
    Output,
>(config: {
    func: DALDefinitionNoAuth<Params, Output>;
}): (...params: Params) => Promise<DALResult<Output>>;

export default function defineDataAccessFunction<
    Params extends unknown[],
    Output,
    AuthUser,
>({
    auth,
    func,
}: {
    auth?: AuthFunction<AuthUser>;
    func:
        | DALDefinitionAuth<Params, Output, AuthUser>
        | DALDefinitionNoAuth<Params, Output>;
}): (...params: Params) => Promise<DALResult<Output>> {
    if (auth) {
        return async (...params: Params): Promise<DALResult<Output>> => {
            const user = await auth();

            const result = await tryCatch(
                (func as DALDefinitionAuth<Params, Output, AuthUser>)(
                    user,
                    ...params,
                ),
            );
            return handleFunctionResult(result);
        };
    }

    return async (...params: Params): Promise<DALResult<Output>> => {
        const result = await tryCatch(
            (func as DALDefinitionNoAuth<Params, Output>)(...params),
        );
        return handleFunctionResult(result);
    };
}

function handleFunctionResult<Output>(res: Result<Output>): DALResult<Output> {
    if (res.error) {
        return { result: null, error: res.error };
    }
    return { result: res.result, error: null };
}
