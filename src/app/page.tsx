import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Page() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get('auth-token');

  if (!isAuthenticated) {
    redirect('/login');
  } else {
    redirect('/dashboard/devices');
  }
}
