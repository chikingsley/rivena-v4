# AI Chatbot API Routes Documentation

This document provides a detailed overview of the API routes used in the AI chatbot application. These routes handle various aspects of the chatbot's functionality, from basic chat interactions to document management, file uploads, and more.

## Table of Contents

- [Chat Route](#chat-route)
- [Document Route](#document-route)
- [Files Upload Route](#files-upload-route)
- [History Route](#history-route)
- [Suggestions Route](#suggestions-route)
- [Vote Route](#vote-route)
- [Core App Files](#core-app-files)
  - [Page Component](#page-component)
  - [Dynamic Chat Page Component](#dynamic-chat-page-component)
  - [Layout Component](#layout-component)
  - [Server Actions](#server-actions)

## Chat Route

**Path:** `/api/chat/route.ts`

### Functionality

The chat route is the core of the AI chatbot, handling message exchanges between the user and the AI model.

### Endpoints

#### POST

- **Purpose:** Process user messages and generate AI responses
- **Request Body:**
  - `id`: Chat session ID
  - `messages`: Array of message objects
  - `selectedChatModel`: The AI model to use for generating responses
- **Authentication:** Required via `auth()`
- **Process:**
  1. Validates user authentication
  2. Extracts the most recent user message
  3. Creates a new chat if one doesn't exist
  4. Saves the user message to the database
  5. Streams AI responses using `createDataStreamResponse` and `streamText`
  6. Supports AI tools/functions:
     - `getWeather`
     - `createDocument`
     - `updateDocument`
     - `requestSuggestions`
  7. Saves AI responses to the database upon completion

#### DELETE

- **Purpose:** Delete a chat session
- **Query Parameters:**
  - `id`: Chat session ID
- **Authentication:** Required via `auth()`
- **Process:**
  1. Validates user authentication
  2. Verifies chat ownership
  3. Deletes the chat session

### Notable Features

- **Streaming Responses:** Uses Vercel AI SDK to stream responses in real-time
- **Tool Integration:** Supports multiple AI tools/functions
- **Maximum Duration:** Set to 60 seconds

## Document Route

**Path:** `/api/document/route.ts`

### Functionality

Manages document creation, retrieval, and deletion for the chatbot application.

### Endpoints

#### GET

- **Purpose:** Retrieve documents by ID
- **Query Parameters:**
  - `id`: Document ID
- **Authentication:** Required via `auth()`
- **Process:**
  1. Validates user authentication
  2. Retrieves documents by ID
  3. Verifies document ownership
  4. Returns document data

#### POST

- **Purpose:** Create or update a document
- **Query Parameters:**
  - `id`: Document ID
- **Request Body:**
  - `content`: Document content
  - `title`: Document title
  - `kind`: Document type (from ArtifactKind)
- **Authentication:** Required via `auth()`
- **Process:**
  1. Validates user authentication
  2. Saves document data to the database
  3. Returns the saved document

#### PATCH

- **Purpose:** Delete document versions after a specific timestamp
- **Query Parameters:**
  - `id`: Document ID
- **Request Body:**
  - `timestamp`: Timestamp after which to delete document versions
- **Authentication:** Required via `auth()`
- **Process:**
  1. Validates user authentication
  2. Verifies document ownership
  3. Deletes document versions created after the specified timestamp

## Files Upload Route

**Path:** `/api/files/upload/route.ts`

### Functionality

Handles file uploads for the chatbot application.

### Endpoints

#### POST

- **Purpose:** Upload files (images)
- **Request Body:**
  - Form data with a `file` field
- **Authentication:** Required via `auth()`
- **Process:**
  1. Validates user authentication
  2. Validates file size (≤ 5MB) and type (JPEG or PNG)
  3. Uploads file to Vercel Blob storage
  4. Returns upload data including URL

### Notable Features

- **File Validation:** Enforces size and type restrictions
- **Storage Integration:** Uses Vercel Blob for file storage
- **Public Access:** Uploads are made publicly accessible

## History Route

**Path:** `/api/history/route.ts`

### Functionality

Retrieves chat history for the authenticated user.

### Endpoints

#### GET

- **Purpose:** Get all chat sessions for the current user
- **Authentication:** Required via `auth()`
- **Process:**
  1. Validates user authentication
  2. Retrieves all chats associated with the user ID
  3. Returns chat history data

## Suggestions Route

**Path:** `/api/suggestions/route.ts`

### Functionality

Manages AI-generated suggestions associated with documents.

### Endpoints

#### GET

- **Purpose:** Retrieve suggestions for a specific document
- **Query Parameters:**
  - `documentId`: Document ID
- **Authentication:** Required via `auth()`
- **Process:**
  1. Validates user authentication
  2. Retrieves suggestions by document ID
  3. Verifies suggestion ownership
  4. Returns suggestion data

### Notable Features

- **Document Association:** Suggestions are linked to specific documents
- **Empty Array Handling:** Returns an empty array if no suggestions exist

## Vote Route

**Path:** `/api/vote/route.ts`

### Functionality

Manages user voting on AI messages.

### Endpoints

#### GET

- **Purpose:** Retrieve votes for a specific chat session
- **Query Parameters:**
  - `chatId`: Chat session ID
- **Authentication:** Required via `auth()`
- **Process:**
  1. Validates user authentication
  2. Retrieves votes by chat ID
  3. Returns vote data

#### PATCH

- **Purpose:** Register a vote (up/down) for a specific message
- **Request Body:**
  - `chatId`: Chat session ID
  - `messageId`: Message ID
  - `type`: Vote type ('up' or 'down')
- **Authentication:** Required via `auth()`
- **Process:**
  1. Validates user authentication
  2. Records the vote in the database

### Notable Features

- **Vote Types:** Supports both upvotes and downvotes
- **Message-Specific:** Votes are associated with specific messages

## Common Patterns

Throughout all routes, several common patterns can be observed:

1. **Authentication:** All routes require authentication via the `auth()` function
2. **Response Handling:** Structured responses with appropriate status codes
3. **Error Handling:** Validation of required parameters with descriptive error messages
4. **Database Integration:** All routes interact with database queries for data persistence
5. **User Ownership:** Routes verify that users can only access their own data

This API structure provides a comprehensive foundation for building a full-featured AI chatbot with document management, file uploads, and user feedback systems.

## Core App Files

In addition to the API routes, several core files handle the rendering and functionality of the chat application. These files work together to create the user interface and implement server-side functionality.

### Page Component

**Path:** `/app/(chat)/page.tsx`

#### Functionality

The page component serves as the main entry point for the chat application, rendering the chat interface and handling initialization.

#### Implementation Details

- **Purpose:** Renders the main chat interface
- **Key Components:**
  - `Chat`: The main chat component that displays messages and input
  - `DataStreamHandler`: Handles real-time data streaming for the chat
- **Process:**
  1. Generates a unique ID for the chat session using `generateUUID()`
  2. Retrieves the selected chat model from cookies (if available)
  3. Renders the Chat component with appropriate props:
     - `id`: The unique chat session ID
     - `initialMessages`: Empty array for a new chat
     - `selectedChatModel`: Either from cookies or the default model
     - `selectedVisibilityType`: Set to "private" by default
     - `isReadonly`: Set to false to allow interaction
  4. Includes the DataStreamHandler component tied to the chat ID

#### Notable Features

- **Cookie-based Model Selection:** Remembers the user's previously selected AI model
- **Session Management:** Creates a unique ID for each chat session
- **Component Composition:** Combines Chat and DataStreamHandler components

### Dynamic Chat Page Component

**Path:** `/app/(chat)/chat/[id]/page.tsx`

#### Functionality

While the main page component creates new chat sessions, this dynamic route page component handles loading and displaying existing chat sessions identified by their unique ID.

#### Implementation Details

- **Purpose:** Renders an existing chat session and its message history
- **Route Pattern:** Uses Next.js dynamic routing with the `[id]` parameter to match any chat ID
- **Key Components:**
  - `Chat`: The main chat component that displays messages and input
  - `DataStreamHandler`: Handles real-time data streaming for the chat
- **Process:**
  1. Extracts the chat ID from the route parameters
  2. Fetches the chat data from the database using `getChatById`
  3. Performs authorization checks:
     - Returns 404 if the chat doesn't exist
     - For private chats, verifies the user is authenticated and is the owner
  4. Loads all existing messages for the chat from the database
  5. Retrieves the selected chat model from cookies (if available)
  6. Renders the Chat component with appropriate props:
     - `id`: The chat session ID from the URL
     - `initialMessages`: Array of messages converted from database format to UI format
     - `selectedChatModel`: Either from cookies or the default model
     - `selectedVisibilityType`: The visibility setting from the chat record
     - `isReadonly`: Set to true if the current user is not the chat owner
  7. Includes the DataStreamHandler component tied to the chat ID

#### Notable Features

- **Authentication and Authorization:** Enforces privacy settings for chat sessions
- **Dynamic Loading:** Loads chat data and messages based on the URL parameter
- **Read-only Mode:** Shows chat in read-only mode for users who don't own the chat
- **Message Conversion:** Converts database message format to UI-compatible format
- **404 Handling:** Returns "not found" for non-existent or unauthorized chats

#### Differences from Main Page Component

| Feature | Main Page Component | Dynamic Chat Page Component |
|---------|--------------------|-----------------------------|
| **Purpose** | Creates new chat sessions | Displays existing chat sessions |
| **Route** | `/chat` | `/chat/[id]` (dynamic) |
| **Initial Messages** | Empty array | Loaded from database |
| **ID Generation** | Generates new UUID | Uses ID from URL parameter |
| **Authorization** | Basic authentication | Checks chat visibility and ownership |
| **Read-only Mode** | Always editable | Read-only for non-owners |

### Layout Component

**Path:** `/app/(chat)/layout.tsx`

#### Functionality

The layout component wraps all chat-related pages, providing consistent UI elements like the sidebar, as well as setting up essential scripts and context providers.

#### Implementation Details

- **Purpose:** Creates the layout structure for the chat application
- **Key Components:**
  - `AppSidebar`: The application sidebar component
  - `SidebarProvider` and `SidebarInset`: Manage sidebar state and layout
- **Process:**
  1. Loads authentication session data and cookie information
  2. Determines if the sidebar should be collapsed based on cookie state
  3. Sets up the Pyodide script for Python functionality (loaded before interactive elements)
  4. Wraps content in the SidebarProvider with appropriate default state
  5. Renders the AppSidebar with user information
  6. Places child components within the SidebarInset

#### Notable Features

- **Persistent Sidebar State:** Uses cookies to remember sidebar collapsed/expanded state
- **Python Integration:** Includes the Pyodide library for Python execution in the browser
- **Partial Prerendering:** Uses Next.js experimental PPR (Partial Prerendering) feature
- **Authentication Integration:** Passes user session data to the sidebar component

### Server Actions

**Path:** `/app/(chat)/actions.ts`

#### Functionality

The server actions file implements server-side functionality that can be called directly from client components, using Next.js "use server" directive.

#### Implementation Details

- **saveChatModelAsCookie**
  - **Purpose:** Saves the selected chat model to a cookie for persistence
  - **Parameters:** `model` - The selected model string
  - **Process:** Sets a cookie named 'chat-model' with the model value

- **generateTitleFromUserMessage**
  - **Purpose:** Automatically generates a title for a chat based on the first user message
  - **Parameters:** `message` - The user's first message object
  - **Process:**
    1. Uses the AI provider's 'title-model' to generate a title
    2. Sets system instructions to create a short, summarized title
    3. Returns the generated title text

- **deleteTrailingMessages**
  - **Purpose:** Deletes all messages in a chat that were created after a specific message
  - **Parameters:** `id` - Message ID
  - **Process:**
    1. Gets the message by its ID
    2. Deletes all messages in the same chat created after this message's timestamp

- **updateChatVisibility**
  - **Purpose:** Updates the visibility setting for a chat
  - **Parameters:**
    - `chatId` - Chat session ID
    - `visibility` - The new visibility type (e.g., "private", "public")
  - **Process:** Updates the chat's visibility setting in the database

#### Notable Features

- **Server-Side Execution:** All functions run on the server using the 'use server' directive
- **Direct Client Invocation:** Can be imported and called directly from client components
- **AI Integration:** Uses AI models for generating titles
- **Database Interaction:** Multiple functions interact with the database for CRUD operations 