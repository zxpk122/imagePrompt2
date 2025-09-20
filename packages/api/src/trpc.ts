import type { NextRequest } from "next/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";

import { transformer } from "./transformer";
import { authOptions } from "@saasfly/auth/nextauth";

interface CreateContextOptions {
  req?: NextRequest;
  headers?: Headers;
}

export const createTRPCContext = async (opts: CreateContextOptions) => {
  const session = opts.req 
    ? await getServerSession(authOptions)
    : null;
    
  return {
    userId: session?.user?.id,
    session,
    ...opts,
  };
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

export const t = initTRPC.context<TRPCContext>().create({
  transformer,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const procedure = t.procedure;
export const mergeRouters = t.mergeRouters;

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  // Make ctx.userId non-nullable in protected procedures
  return next({ ctx: { userId: ctx.session.user.id, session: ctx.session } });
});


export const protectedProcedure = procedure.use(isAuthed);