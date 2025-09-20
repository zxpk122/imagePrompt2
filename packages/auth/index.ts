import { getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "./nextauth";

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

declare global {
  interface CustomJwtSessionClaims {
    user?: User & {
      id: string;
      isAdmin: boolean;
    }
  }
}

export const authOptions = {
  ...nextAuthOptions,
  pages: {
    signIn: "/login",
  },
}

export async function getCurrentUser() {
  const session = await getServerSession(nextAuthOptions);
  return session?.user;
}
