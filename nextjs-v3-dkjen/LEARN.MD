
## MY CONFIGS

https://authjs.dev/getting-started/installation

 "packageManager": "npm@10.8.2",
  "overrides": {
    "react": "$react",
    "react-dom": "$react"
  },

AUTH_SECRET="OltdPzybZa4lMyCh03R7yERA5Sk1pO6PSnkcz/ymdTQ=" # Added by `npx auth`. Read more: https://cli.authjs.dev
AUTH_GITHUB_ID="Ov23li7nXR0vdSXKQfev" # Replace with your GitHub OAuth App Client ID
AUTH_GITHUB_SECRET="dfc567d7a88a3f5b6db7d8e7f181546f8fc855c3" # Replace with your GitHub OAuth App Client Secret
NEXTAUTH_URL="http://localhost:3000" # Replace with your application's URL
DATABASE_URL="file:./dev.db" # Example for SQLite, replace with


### 🔹 PRISMA
DATABASE_URL = "postgresql://neondb_owner:npg_KpFsA5xb2Mwu@ep-rapid-grass-aef6d605-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

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
