import "server-only";

import { cookies } from "next/headers";
import { createTRPCProxyClient, loggerLink } from "@trpc/client";
import { AppRouter } from "@saasfly/api";
import { transformer } from "./shared";
import { observable } from "@trpc/server/observable";
import { TRPCErrorResponse } from "@trpc/server/rpc";
import { cache } from "react";
import { appRouter } from "../../../../packages/api/src/root";
import { getServerSession } from "next-auth";
import { authOptions } from "@saasfly/auth";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const session = await getServerSession(authOptions);
  
  return {
    headers: new Headers({
      cookie: cookies().toString(),
      "x-trpc-source": "rsc",
    }),
    session,
    userId: session?.user?.id,
  };
});

export const trpc = createTRPCProxyClient<AppRouter>({
  transformer,
  links: [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error),
    }),
    /**
     * Custom RSC link that lets us invoke procedures without using http requests. Since Server
     * Components always run on the server, we can just call the procedure as a function.
     */
    () =>
      ({op}) =>
        observable((observer) => {
          createContext()
            .then((ctx) => {
              const procedure = appRouter._def.procedures[op.path];
              if (!procedure) {
                throw new Error(`No such procedure: ${op.path}`);
              }
              return procedure({
                rawInput: op.input,
                path: op.path,
                type: op.type,
                ctx,
              });
            })
            .then((data) => {
              observer.next({result: {data}});
              observer.complete();
            })
            .catch((cause: TRPCErrorResponse) => {
              // 使用自定义错误处理而不是TRPCClientError.from
              observer.error(new Error(cause.message || "TRPC调用错误"));
            });
        }),
  ],
});

export {type RouterInputs, type RouterOutputs} from "@saasfly/api";
