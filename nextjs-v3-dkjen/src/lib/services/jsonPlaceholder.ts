// lib/services/jsonPlaceholder.ts

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export async function fetchPosts(): Promise<Post[]> {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts');
  if (!res.ok) {
    throw new Error(`fetchPosts failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function fetchPostById(id: number): Promise<Post | null> {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`fetchPostById failed: ${res.status}`);
  }
  return res.json();
}
