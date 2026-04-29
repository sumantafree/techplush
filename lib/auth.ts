import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { supabaseAdmin } from "./supabase";

export const authOptions: NextAuthOptions = {
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER || "",
      from: process.env.EMAIL_FROM || "noreply@theaihublab.com",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/login?sent=1",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const { error } = await supabaseAdmin.from("users").upsert(
        { email: user.email, name: user.name, image: user.image },
        { onConflict: "email", ignoreDuplicates: false }
      );
      if (error) console.error("Error upserting user:", error.message);
      return true;
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        const { data } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("email", session.user.email!)
          .single();
        if (data) (session.user as any).id = data.id;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) token.userId = user.id;
      return token;
    },
  },
};
