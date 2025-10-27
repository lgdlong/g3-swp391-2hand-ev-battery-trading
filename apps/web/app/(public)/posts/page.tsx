import { redirect } from 'next/navigation';

export default function PostsIndexRedirect() {
  redirect('/posts/ev');
}
