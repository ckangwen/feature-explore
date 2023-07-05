import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type DefaultSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import db from "db";
import { verifyPassword } from "./helpers";
import { SignInErrorCode, getSignInErrorMessage } from "./error-code";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure
 * adapters, providers, callbacks, etc.
 * @see https://next-auth.js.org/configuration/options
 **/
export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    // https://github.com/formbricks/formbricks/blob/main/apps/web/app/api/auth/%5B...nextauth%5D/authOptions.ts
    async jwt({ token, user, account }) {
      return token;
    },
  },
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },

      /**
       * 在 signin() 中调用
       */
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("Credential missing in authorize()");
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email.toLowerCase(),
          },
          select: {
            id: true,
            email: true,
            password: true,
            name: true,
            emailVerified: true,
          },
        });

        if (!user) {
          throw new Error(getSignInErrorMessage(SignInErrorCode.UserNotFound));
        }

        if (!user.emailVerified) {
          throw new Error(getSignInErrorMessage(SignInErrorCode.UserNotFound));
        }

        if (!user.password) {
          throw new Error(getSignInErrorMessage(SignInErrorCode.UserMissingPassword));
        }

        const isCorrectPassword = await verifyPassword(credentials.password, user.password);

        if (!isCorrectPassword) {
          throw new Error(getSignInErrorMessage(SignInErrorCode.IncorrectPassword));
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
};
