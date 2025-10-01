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
