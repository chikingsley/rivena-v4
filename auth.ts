import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { jwt } from "better-auth/plugins";

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
       github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        redirectURI: "http://localhost:3000/api/auth/callback/github"
       },
       facebook: {
        clientId: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        redirectURI: "http://localhost:3000/api/auth/callback/facebook"
       }
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
    },
    plugins: [
        jwt({
            jwt: {
                // Set JWT to expire in 1 hour
                expirationTime: "1h",
                // Customize what's in the JWT payload
                definePayload: (session) => ({
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.name,
                    // Include any other fields needed for instant validation
                })
            }
        })
    ]
});