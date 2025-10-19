'use client';
import { SignIn } from '@clerk/nextjs';

export default function SignInComponent() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        justifyContent: 'center',
        alignItems: 'center',
        height: '90vh',
      }}
    >
      <h1>Welcome Back</h1>
      <SignIn path="/sign-in" signUpUrl="/sign-up" />
      <p style={{ fontSize: '0.8rem', color: 'gray' }}>By signing in, you agree to our Terms of Service.</p>
    </div>
  );
}
