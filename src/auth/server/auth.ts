import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", 
    }),
    emailAndPassword: {  
        enabled: true,
        autoSignIn: true 
    },
    socialProviders: {
       google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectURI: "http://localhost:3000/api/auth/callback/google"
       },
    },
    session: {
        // Set session duration to 30 days (in seconds)
        expiresIn: 30 * 24 * 60 * 60,
        // Use more secure cookie settings
        cookie: {
            sameSite: "lax",
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        }
    }
})