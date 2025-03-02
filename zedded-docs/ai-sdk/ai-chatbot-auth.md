# AI Chatbot Authentication System Documentation

This document provides a detailed overview of the authentication system used in the AI chatbot application. The system handles user registration, login, session management, and protected routes.

## Table of Contents

- [Overview](#overview)
- [Core Authentication Files](#core-authentication-files)
  - [Auth Configuration](#auth-configuration)
  - [Auth Implementation](#auth-implementation)
  - [Auth Actions](#auth-actions)
- [Authentication API](#authentication-api)
  - [NextAuth API Route](#nextauth-api-route)
- [Authentication Pages](#authentication-pages)
  - [Login Page](#login-page)
  - [Registration Page](#registration-page)
- [Authentication Flow](#authentication-flow)

## Overview

The authentication system is built using [NextAuth.js](https://next-auth.js.org/), a complete authentication solution for Next.js applications. It uses a credentials-based authentication approach with email and password, storing user information in a database with encrypted passwords.

Key features of the authentication system include:

- Email and password-based authentication
- Secure password storage with bcrypt hashing
- Session management with JWT (JSON Web Tokens)
- Protected routes with server-side authentication checks
- Client-side redirection based on authentication state

## Core Authentication Files

### Auth Configuration

**Path:** `/app/(auth)/auth.config.ts`

#### Functionality

Defines the core configuration for NextAuth, including custom pages, authorization logic, and basic settings.

#### Implementation Details

- **Custom Pages Configuration:**
  - `signIn`: Points to '/login' as the custom sign-in page
  - `newUser`: Points to '/' as the redirect for new users after registration

- **Authorization Logic:**
  - Determines if a user can access specific pages based on authentication status
  - Redirects authenticated users away from login/register pages to the main application
  - Restricts access to chat pages to authenticated users only
  - Always allows access to login and registration pages

#### Notable Features

- **Route Protection:** Implements logic to protect routes based on authentication status
- **Context-Aware Redirects:** Redirects users to appropriate pages based on their authentication status and the requested URL
- **Clean Separation:** Keeps configuration separate from implementation for better portability

### Auth Implementation

**Path:** `/app/(auth)/auth.ts`

#### Functionality

Implements the NextAuth authentication system with credential-based login, including password verification and session management.

#### Implementation Details

- **Provider Configuration:**
  - Uses the Credentials provider for email/password authentication
  - Implements the `authorize` function to validate credentials against the database

- **Authentication Methods:**
  - Exposes standard NextAuth methods: 
    - `GET` and `POST` handlers for API routes
    - `auth` for retrieving the session
    - `signIn` and `signOut` for authentication actions

- **Callback Functions:**
  - `jwt`: Customizes the JWT token to include the user ID
  - `session`: Enhances the session object with user data from the token

#### Notable Features

- **Password Hashing:** Uses bcrypt for secure password comparison
- **Type Extensions:** Extends the Session type to include custom user fields
- **Session Customization:** Adds user ID to session data for identification throughout the application

### Auth Actions

**Path:** `/app/(auth)/actions.ts`

#### Functionality

Implements server actions for login and registration using the "use server" directive, providing a server-side API for authentication that can be called directly from client components.

#### Implementation Details

- **Schema Validation:**
  - Uses Zod to validate user input for both login and registration
  - Requires valid email format and password with minimum length of 6 characters

- **Login Action:**
  - Validates form data against the auth schema
  - Attempts to sign in the user using credentials
  - Returns status information for client-side handling

- **Registration Action:**
  - Validates form data against the auth schema
  - Checks if the user already exists
  - Creates a new user with hashed password if they don't exist
  - Signs in the user automatically upon successful registration
  - Returns status information for client-side handling

#### Notable Features

- **Type Safety:** Provides TypeScript interfaces for action states
- **Comprehensive Status Reporting:** Returns detailed status codes for various scenarios
- **Form Data Handling:** Works directly with FormData objects from client-side forms
- **Error Handling:** Provides specific error types for different failure modes

## Authentication API

### NextAuth API Route

**Path:** `/app/(auth)/api/auth/[...nextauth]/route.ts`

#### Functionality

Provides the API endpoints required by NextAuth for authentication operations.

#### Implementation Details

- **API Handler Export:**
  - Exports the GET and POST handlers from the auth implementation
  - Uses Next.js's catch-all route pattern (`[...nextauth]`) to handle all NextAuth endpoints

#### Notable Features

- **Minimal Implementation:** Leverages the handlers defined in the auth implementation file
- **Catch-All Pattern:** Single route file handles all NextAuth API operations

## Authentication Pages

### Login Page

**Path:** `/app/(auth)/login/page.tsx`

#### Functionality

Provides a user interface for signing into the application using email and password credentials.

#### Implementation Details

- **Client Components:**
  - Uses the 'use client' directive for client-side interactivity
  - Uses the `AuthForm` component for form rendering
  - Uses the `SubmitButton` component to show submission state

- **State Management:**
  - Tracks email input for persistence across form submissions
  - Tracks success state for UI feedback
  - Uses `useActionState` to interact with the login server action

- **Form Handling:**
  - Captures form submission and passes data to the server action
  - Displays toast notifications based on login status

#### Notable Features

- **Error Feedback:** Provides toast notifications for different error scenarios
- **Success Handling:** Refreshes the router on successful login
- **Navigation Options:** Includes a link to the registration page

### Registration Page

**Path:** `/app/(auth)/register/page.tsx`

#### Functionality

Provides a user interface for creating a new account using email and password.

#### Implementation Details

- **Client Components:**
  - Uses the 'use client' directive for client-side interactivity
  - Uses the `AuthForm` component for form rendering
  - Uses the `SubmitButton` component to show submission state

- **State Management:**
  - Tracks email input for persistence across form submissions
  - Tracks success state for UI feedback
  - Uses `useActionState` to interact with the register server action

- **Form Handling:**
  - Captures form submission and passes data to the server action
  - Displays toast notifications based on registration status

#### Notable Features

- **Comprehensive Error Handling:** Shows different messages for existing users, validation errors, and general failures
- **Success Feedback:** Shows success toast and refreshes the router on successful registration
- **Navigation Options:** Includes a link to the login page

## Authentication Flow

The authentication flow in the AI chatbot application follows these steps:

1. **User Registration:**
   - User visits the registration page
   - User inputs email and password
   - System validates input
   - System checks if the user already exists
   - If not, system creates a new user with a hashed password
   - System automatically signs in the new user

2. **User Login:**
   - User visits the login page
   - User inputs email and password
   - System validates input
   - System verifies credentials against the database
   - If valid, system creates a session and JWT token
   - User is redirected to the main application

3. **Session Management:**
   - JWT token contains user ID and is stored securely
   - Session data is available through the `auth()` function
   - Protected routes check session validity
   - Unauthenticated users are redirected to login

4. **Route Protection:**
   - Chat routes check for valid session
   - Authenticated users accessing login/register are redirected to main application
   - Unauthenticated users accessing protected routes are redirected to login

5. **Logout:**
   - User can sign out using the `signOut()` function
   - Session is destroyed and JWT token is invalidated
   - User is redirected to the login page 