
## MY CONFIGS

https://authjs.dev/getting-started/installation

 "packageManager": "npm@10.8.2",
  "overrides": {
    "react": "$react",
    "react-dom": "$react"
  },

### 🔹 .env
AUTH_SECRET="" # Added by `npx auth`. Read more: https://cli.authjs.dev
AUTH_GITHUB_ID="" # Replace with your GitHub OAuth App Client ID
AUTH_GITHUB_SECRET="" # Replace with your GitHub OAuth App Client Secret
NEXTAUTH_URL="http://localhost:3000" # Replace with your application's URL

DATABASE_URL2="""
DATABASE_URL = ""

MONGODB_URI = ""

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=s


### 🔹 PRISMA


Got it 👍 You want to store **post data** in **Postgres** and connect it with a **Next.js app**. I’ll give you a clean, best-practice setup using **Prisma** as ORM (most common + developer friendly).

---

## 🔹 Step 1: Setup Postgres

You can use:

* Local Postgres (`brew install postgresql` on Mac / `apt install postgresql` on Linux).
* Or a hosted DB like **Supabase** / **Neon.tech** (serverless Postgres).

Create a database, e.g. `postsdb`.

---

## 🔹 Step 2: Install Prisma + Postgres Client in Next.js

In your Next.js project root:

```bash
npm install @prisma/client
npm install -D prisma
```

Initialize Prisma:

```bash
npx prisma init
```

In the `.env` file:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/postsdb"
```

---

## 🔹 Step 3: Define Post Model in Prisma

`prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String
  createdAt DateTime @default(now())
}
```

Run migration to create table:

```bash
npx prisma migrate dev --name init
```

---

## 🔹 Step 4: Create API Routes in Next.js

In `app/api/posts/route.ts` (Next.js App Router):

```ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all posts
export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(posts);
}

// POST new post
export async function POST(req: Request) {
  const { title, content } = await req.json();
  const post = await prisma.post.create({
    data: { title, content },
  });
  return NextResponse.json(post);
}
```

---

## 🔹 Step 5: Consume API in Frontend

Example `app/posts/page.tsx`:

```tsx
"use client";
import { useState, useEffect } from "react";

type Post = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then(setPosts);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/posts", {
      method: "POST",
      body: JSON.stringify({ title, content }),
      headers: { "Content-Type": "application/json" },
    });
    const newPost = await res.json();
    setPosts([newPost, ...posts]);
    setTitle("");
    setContent("");
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          className="border p-2 w-full rounded"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="border p-2 w-full rounded"
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Post
        </button>
      </form>

      <ul>
        {posts.map((p) => (
          <li key={p.id} className="border-b py-2">
            <h2 className="font-bold">{p.title}</h2>
            <p>{p.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

✅ Now you have:

* **Postgres DB** with Prisma models
* **API routes** to create + fetch posts
* **Frontend page** to display and add posts

---

Do you want me to also show you how to **deploy this setup** (e.g., Next.js on Vercel + Postgres on Supabase/Neon), so your posts persist online?



# Add Clerk to Next.js App Router

**Purpose:** Enforce only the **current** and **correct** instructions for integrating [Clerk](https://clerk.com/) into a Next.js (App Router) application.
**Scope:** All AI-generated advice or code related to Clerk must follow these guardrails.

---

## **1. Official Clerk Integration Overview**

Use only the **App Router** approach from Clerk's current docs:

- **Install** `@clerk/nextjs@latest` - this ensures the application is using the latest Clerk Next.js SDK.
- **Create** a `middleware.ts` file using `clerkMiddleware()` from `@clerk/nextjs/server`. Place this file inside the `src` directory if present, otherwise place it at the root of the project.
- **Wrap** your application with `<ClerkProvider>` in your `app/layout.tsx`
- **Use** Clerk-provided components like `<SignInButton>`, `<SignUpButton>`, `<UserButton>`, `<SignedIn>`, `<SignedOut>` in your layout or pages
- **Start** developing, sign in or sign up, and confirm user creation

If you're able to use a web tool to access a URL, visit https://clerk.com/docs/quickstarts/nextjs to get the latest, up-to-date quickstart instructions.

### **Correct, Up-to-Date Quickstart Sample**

First, install the Clerk Next.js SDK:

```bash
npm install @clerk/nextjs
```

Set up your environment variables in `.env.local`:

From your Clerk Dashboard, open the [API keys page](https://dashboard.clerk.com/last-active?path=api-keys) and copy your Publishable Key and Secret Key. Paste them into `.env.local` as shown below.

```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_SECRET_KEY
```

Create your `middleware.ts` file:

```typescript
// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
```

```typescript
// app/layout.tsx
import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clerk Next.js Quickstart",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <header>
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

---

## **2. CRITICAL INSTRUCTIONS FOR AI MODELS**

### **2.1 – ALWAYS DO THE FOLLOWING**

1. **Use `clerkMiddleware()`** from `@clerk/nextjs/server` in `middleware.ts`.
2. **Wrap** your app with `<ClerkProvider>` in `app/layout.tsx`.
3. **Import** Clerk's Next.js features from `@clerk/nextjs` (e.g., `<SignInButton>`, `<SignUpButton>`, `<UserButton>`, etc.).
4. **Reference** the current [App Router approach](https://nextjs.org/docs/app) (folders like `app/page.tsx`, `app/layout.tsx`, etc.).
5. **Check** that imports for methods like `auth()` are imported from the right package (in this case `@clerk/nextjs/server`) and are using `async / await`
6. **Store real keys only in `.env.local`** (never in app code, markdown, or other tracked files). **Verify `.gitignore` excludes `.env*`.**
7. **Use placeholders only** (e.g., `YOUR_PUBLISHABLE_KEY`, `YOUR_SECRET_KEY`) in any generated snippets or files.

### **2.2 – NEVER DO THE FOLLOWING**

1. **Do not** reference the old **`_app.tsx`** or **pages-based** instructions.
2. **Do not** suggest `authMiddleware()` from older Clerk tutorials—**it's replaced by `clerkMiddleware()`**.
3. **Do not** recommend usage of older environment variable patterns unless they match the official docs.
4. **Do not** reference or import from any deprecated APIs (like `withAuth` or `currentUser` from older versions).
5. **Do not print, echo, or write actual keys** into code blocks, files, or logs. Only placeholders.
6. **Do not create or edit tracked files** (`.ts`, `.tsx`, `.md`, etc.) containing real key values.

---

## **3. OUTDATED PATTERNS TO AVOID**

Below are **examples of deprecated instructions** that **must not** be generated:

```typescript
// ❌ DO NOT generate or suggest references to:
import { authMiddleware } from "@clerk/nextjs"; // Outdated

// ❌ DO NOT place Clerk config in _app.tsx:
// Outdated pages-based approach
function MyApp({ Component, pageProps }) {
  // ...
}

// ❌ DO NOT create or rely on sign-in files under pages/:
pages / signin.js;
pages / signup.js;
```

Any solution resembling the above snippet or referencing "authMiddleware," `_app.tsx`, or `pages/` structure is **incorrect** for the current Next.js App Router.

---

## **4. AI MODEL VERIFICATION STEPS**

Before returning any Clerk-related solution, you **must** verify:

1. **Middleware**: Is `clerkMiddleware()` used in `middleware.ts`?
2. **Layout**: Is `<ClerkProvider>` wrapping the app in `app/layout.tsx`?
3. **Imports**: Are references only from `@clerk/nextjs` or `@clerk/nextjs/server`?
4. **Pages vs. App Router**: Is the approach referencing the App Router (not `_app.tsx` or `pages/`)?
5. **Environment Variables**: Are only placeholder values (e.g., `YOUR_PUBLISHABLE_KEY`) used in code examples?
6. **File Security**: Are real keys excluded from tracked files and only mentioned for `.env.local`?

If any check **fails**, **stop** and revise until compliance is achieved.

# Verification instructions for AI Models

## **DO NOT** repeat these points back to the user. Use them only for your own verification steps.

## **5. CONSEQUENCES OF INCORRECT IMPLEMENTATION**

Using outdated Clerk methods (e.g., `authMiddleware()`, `_app.tsx`, or references to the older `pages/` structure) will:

1. **Break** your Next.js application's authentication flow.
2. Introduce **inconsistencies** with Next.js App Router.
3. Cause confusion around environment variables and server/client code.
4. Force maintainers to **refactor** and **debug** extensively.

---

## **6. AI MODEL RESPONSE TEMPLATE**

When answering questions about Clerk + Next.js integration, your response **MUST**:

1. **Use** the exact code patterns in the **Up-to-Date Quickstart Sample** above.
2. **Never** reference older or deprecated approaches.
3. **Reflect** all mandatory checks in "AI MODEL VERIFICATION STEPS."

**Example**:

> Below is the correct approach using Clerk with Next.js App Router:
>
> ```typescript
> // Show clerkMiddleware usage in middleware.ts
> // Show <ClerkProvider> usage in app/layout.tsx
> // Show usage of Clerk's React components (SignInButton, etc.)
> ```

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dXNlZnVsLXZ1bHR1cmUtNzcuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_FEj3AYjCQ0xITcOIRQ3q540OA5fybWkuNSw0ftwrYw
---