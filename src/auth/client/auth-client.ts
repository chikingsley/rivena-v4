import { createAuthClient } from "better-auth/client"

export const { signIn, signUp, signOut, useSession } = createAuthClient({
    baseURL: import.meta.env.BETTER_AUTH_URL || "http://localhost:3000/api/auth"
})