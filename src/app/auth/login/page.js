'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();

  if (user) {
    router.push('/dashboard');
    return null;
  }

  const handleLoginSuccess = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <LoginForm onSuccess={handleLoginSuccess} />
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register">
              <Button variant="outline" size="sm">
                Create Account
              </Button>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
