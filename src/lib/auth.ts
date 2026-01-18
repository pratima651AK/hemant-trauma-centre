import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin Access",
      credentials: {
        password: { label: "Admin Key", type: "password" },
      },
      async authorize(credentials) {
        const isValid = credentials?.password === process.env.ADMIN_SECRET_KEY;
        
        if (isValid) {
          return { id: "1", name: "Administrator", email: "admin@hemant-trauma-centre.com" };
        } else {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/admin/login", // We will create a custom login page or redirect to admin
    // For now, let's just let NextAuth handle it or use the default one, 
    // but typically we want to keep the user on /admin if they are not logged in.
    // Actually, let's keep it simple: if unauthenticated, show the NextAuth default login for a start, 
    // or better yet, reuse our existing UI in the Admin page.
  },
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60, // 2 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.id;
      }
      return session;
    },
  },
};
