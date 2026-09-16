import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-gradient-to-b from-indigo-50/40 via-white to-[#faf8ff] dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md flex flex-col items-center space-y-4">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'w-full shadow-modal rounded-2xl',
              card: 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-none',
              formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold rounded-xl',
              headerTitle: 'font-heading font-bold text-slate-900 dark:text-white text-xl',
              headerSubtitle: 'text-xs text-slate-500',
              socialButtonsBlockButton: 'rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800',
              formFieldInput: 'rounded-xl border-slate-200 dark:border-slate-800 text-xs',
              footerActionLink: 'text-indigo-600 hover:text-indigo-700 font-semibold',
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/onboarding"
        />
      </div>
    </div>
  );
}
