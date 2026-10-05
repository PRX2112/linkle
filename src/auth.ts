import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import crypto from "crypto"

const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV !== "production" ? "linkle-development-secret-key-32chars" : undefined);

const providers: any[] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        // Generate a unique safe username fallback based on email prefix + 4-char random string
        const emailPrefix = profile.email ? profile.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_-]/g, "") : "user";
        const uniqueSuffix = Math.random().toString(36).substring(2, 6);
        const uniqueUsername = `${emailPrefix}_${uniqueSuffix}`;

        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          username: uniqueUsername,
        };
      }
    })
  );
}

providers.push(
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Invalid credentials");
      }

      const normalizedEmail = (credentials.email as string).trim().toLowerCase();

      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });

      if (!user || !user.password) {
        throw new Error("Invalid credentials");
      }

      const isPasswordValid = await bcrypt.compare(
        credentials.password as string,
        user.password
      );

      if (!isPasswordValid) {
        throw new Error("Invalid credentials");
      }

      // Generate password hash signature to detect password resets across sessions
      const pwdSig = crypto.createHash("sha256").update(user.password).digest("hex").slice(0, 16);

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        username: user.username,
        pwdSig,
      } as any;
    }
  })
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.username = (user as any).username
        if ((user as any).pwdSig) {
          token.pwdSig = (user as any).pwdSig
        }
      }

      if (trigger === "update" && session?.username) {
        token.username = session.username
      }

      // Invalidate active session if user has a password signature and their password has changed or account deleted
      if (token.id && token.pwdSig) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { password: true, username: true }
        });

        // Account was deleted or has no password
        if (!dbUser || !dbUser.password) {
          return null as any;
        }

        const currentSig = crypto.createHash("sha256").update(dbUser.password).digest("hex").slice(0, 16);
        // Password was changed or reset -> immediately invalidate session
        if (token.pwdSig !== currentSig) {
          return null as any;
        }

        // Keep username synchronized if updated
        if (dbUser.username && token.username !== dbUser.username) {
          token.username = dbUser.username;
        }
      }

      return token
    },
    async session({ session, token }) {
      if (!token || !token.id) {
        return null as any;
      }
      if (session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string | undefined
      }
      return session
    }
  }
})

