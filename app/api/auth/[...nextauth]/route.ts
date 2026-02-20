import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {   // 🔥 MUST BE exported
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
  console.log("LOGIN ATTEMPT:", credentials?.email);

  const user = await prisma.user.findUnique({
    where: { email: credentials?.email },
  });

  console.log("DB USER:", user);

  if (!user) {
    console.log("NO USER FOUND");
    return null;
  }

  const valid = await bcrypt.compare(
    credentials!.password,
    user.password
  );

  console.log("PASSWORD VALID:", valid);

  if (!valid) {
    console.log("INVALID PASSWORD");
    return null;
  }

  return {
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  isSuperAdmin: user.isSuperAdmin,
};
}
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
  // Initial login
  if (user) {
    token.id = user.id;
    token.role = (user as any).role;
    token.name = user.name;
    token.isSuperAdmin = (user as any).isSuperAdmin;
    token.email = user.email;
    token.image = (user as any).image ?? null;
  }

  // When calling update()
  if (trigger === "update" && session?.user) {
    token.name = session.user.name;
    token.email = session.user.email;
    token.image = session.user.image ?? null;
  }

  return token;
},

    async session({ session, token }) {
  if (session.user) {
    session.user.id = token.id as string;
    session.user.name = token.name as string;
    session.user.email = token.email as string;
    session.user.image = token.image as string | null;
    (session.user as any).role = token.role;
    (session.user as any).isSuperAdmin = token.isSuperAdmin;
  }

  return session;
},
  },

  pages: {
  signIn: "/auth",
},

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };