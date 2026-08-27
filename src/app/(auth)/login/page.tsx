'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Scissors, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { signInAction } from '@/features/auth/actions';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await signInAction({ email, password });
      if (response && response.success) {
        toast.success('Logged in successfully');
        router.push('/');
        router.refresh();
      } else if (response && !response.success) {
        setErrorMessage(response.error || 'Login failed');
        toast.error(response.error || 'Login failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-radial from-stone-900 via-neutral-950 to-neutral-950 px-4 py-12 overflow-hidden">
      {/* Abstract Design Elements representing tailoring - Threads/Curves */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full border border-stone-800/20 pointer-events-none animate-[spin_120s_linear_infinite]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full border border-stone-800/10 pointer-events-none animate-[spin_90s_linear_infinite]" />

      <div className="relative w-full max-w-md z-10">
        <Card className="border border-stone-800 bg-black/60 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="space-y-3 text-center pb-6 border-b border-stone-900">
            <div className="flex justify-center">
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/30 shadow-inner group transition-all duration-300 hover:scale-105">
                <Scissors className="w-8 h-8 text-amber-500 transform -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
              </div>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-stone-100 to-amber-200 bg-clip-text text-transparent">
                HUZAIFA
              </CardTitle>
              <CardDescription className="text-stone-400 text-sm tracking-widest uppercase">
                Tailoring Management System
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-stone-300 text-xs font-semibold uppercase tracking-wider">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@huzaifa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                    className="pl-10 h-11 bg-stone-950/70 border-stone-800 text-stone-200 placeholder-stone-600 focus:border-amber-500/60 focus:ring-amber-500/20 rounded-lg transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-stone-300 text-xs font-semibold uppercase tracking-wider">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="pl-10 h-11 bg-stone-950/70 border-stone-800 text-stone-200 placeholder-stone-600 focus:border-amber-500/60 focus:ring-amber-500/20 rounded-lg transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold tracking-wide rounded-lg transition-all duration-300 cursor-pointer shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="text-center text-xs text-stone-400 mt-4">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors hover:underline">
                  Sign Up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
