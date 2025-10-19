'use client';
import { SignUp } from '@clerk/nextjs';

export default function SignUpComponent() {
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
      <h1>Register</h1>
      <SignUp path="/sign-up" signInUrl="/sign-in" />
      <p style={{ fontSize: '0.8rem', color: 'gray' }}>By signing up, you agree to our Terms of Service.</p>
    </div>
  );
}
