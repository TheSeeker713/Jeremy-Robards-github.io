import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

export default function AuthPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(!!supabase);
  }, []);

  if (!supabase) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-2">Auth not configured</h1>
        <p className="text-slate-300">Add your <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to enable sign up / login.</p>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      {ready && (
        <Auth supabaseClient={supabase} providers={[]} appearance={{ theme: ThemeSupa }} />
      )}
    </main>
  );
}
