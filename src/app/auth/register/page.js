'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RegisterForm from '@/components/auth/RegisterForm';
import {Button} from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState('register');

  if (user) {
    router.push('/dashboard');
    return null;
  }

  const handleRegistrationSuccess = () => {
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Registration Complete!</h1>
          <p className="text-muted-foreground max-w-md">
            Your account has been created successfully. You can now proceed to the dashboard 
            to start creating your DID and managing your credentials.
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <RegisterForm onSuccess={handleRegistrationSuccess} />
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
