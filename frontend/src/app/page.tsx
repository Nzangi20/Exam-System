import { redirect } from 'next/navigation';

// Safe build trigger comment for Vercel deployment
export default function Home() {
  redirect('/login');
}
