import { getServerSession, NextAuthOptions, User } from "next-auth";
import { KyselyAdapter } from "@auth/kysely-adapter";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";

import { MagicLinkEmail, resend, siteConfig } from "@saasfly/common";

import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";

import { db } from "./db";
import { env } from "./env.mjs";

type UserId = string;
type IsAdmin = boolean;

declare module "next-auth" {
  interface Session {
    user: User & {
      id: UserId;
      isAdmin: IsAdmin;
    };
  }
}

declare module "next-auth" {
  interface JWT {
    isAdmin: IsAdmin;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  adapter: KyselyAdapter(db),

  providers: [
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        httpOptions: { timeout: 15000 },
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code"
          }
        }
      })
    ] : []),
    ...(env.RESEND_FROM ? [
      EmailProvider({
        sendVerificationRequest: async ({ identifier, url }) => {
          const user = await db
            .selectFrom("User")
            .select(["name", "emailVerified"])
            .where("email", "=", identifier)
            .executeTakeFirst();
          const userVerified = !!user?.emailVerified;
          const authSubject = userVerified
            ? `Sign-in link for ${(siteConfig as { name: string }).name}`
            : "Activate your account";

          try {
            if (resend) {
              await resend.emails.send({
                from: env.RESEND_FROM!,
                to: identifier,
                subject: authSubject,
                react: MagicLinkEmail({
                  firstName: user?.name ?? "",
                  actionUrl: url,
                  mailType: userVerified ? "login" : "register",
                  siteName: (siteConfig as { name: string }).name,
                }),
                // Set this to prevent Gmail from threading emails.
                // More info: https://resend.com/changelog/custom-email-headers
                headers: {
                  "X-Entity-Ref-ID": new Date().getTime() + "",
                },
              });
            } else {
              console.warn("Resend API key not configured, skipping email send");
            }
          } catch (error) {
            console.log(error);
          }
        },
      })
    ] : []),
  ],
  callbacks: {
    session({ token, session }) {
      if (token) {
        if (session.user) {
          session.user.id = token.id as string;
          session.user.name = token.name;
          session.user.email = token.email;
          session.user.image = token.picture;
          session.user.isAdmin = token.isAdmin as boolean;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      const email = token?.email ?? "";
      const dbUser = await db
        .selectFrom("User")
        .where("email", "=", email)
        .selectAll()
        .executeTakeFirst();
      if (!dbUser) {
        if (user) {
          token.id = user?.id;
        }
        return token;
      }
      let isAdmin = false;
      if (env.ADMIN_EMAIL) {
        const adminEmails = env.ADMIN_EMAIL.split(",");
        if (email) {
          isAdmin = adminEmails.includes(email);
        }
      }
      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        isAdmin: isAdmin,
      };
    },
  },
  debug: env.IS_DEBUG === "true",
};

// Use it in server contexts
export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authOptions);
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}
