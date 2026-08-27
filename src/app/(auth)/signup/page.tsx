'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Scissors, Mail, Lock, User, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { signUpAction } from '@/features/auth/actions';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Validation and API error states
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const [signupSuccess, setSignupSuccess] = useState(false);

  const validateForm = () => {
    const tempErrors: typeof errors = {};
    let isValid = true;

    if (!fullName.trim()) {
      tempErrors.fullName = 'Full Name is required';
      isValid = false;
    } else if (fullName.trim().length < 2) {
      tempErrors.fullName = 'Full Name must be at least 2 characters';
      isValid = false;
    }

    if (!email) {
      tempErrors.email = 'Email Address is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!password) {
      tempErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!confirmPassword) {
      tempErrors.confirmPassword = 'Confirm Password is required';
      isValid = false;
    } else if (password !== confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await signUpAction({
        fullName,
        email,
        password,
        confirmPassword,
      });

      if (response && response.success) {
        toast.success('Account created successfully!');
        
        // If hasSession is true, they are logged in directly (email verification disabled)
        if (response.data.hasSession) {
          router.push('/');
          router.refresh();
        } else {
          // hasSession is false when a verification email was sent
          setSignupSuccess(true);
        }
      } else if (response && !response.success) {
        // Parse validation errors from Zod if present
        if (response.validationErrors) {
          const formattedErrors: typeof errors = {};
          Object.keys(response.validationErrors).forEach((key) => {
            formattedErrors[key as keyof typeof errors] = response.validationErrors![key]?.[0];
          });
          setErrors(formattedErrors);
        } else {
          setErrors({ general: response.error || 'Signup failed' });
          toast.error(response.error || 'Signup failed');
        }
      }
    } catch (err: any) {
      setErrors({ general: err.message || 'An unexpected error occurred' });
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (signupSuccess) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-radial from-stone-900 via-neutral-950 to-neutral-950 px-4 py-12 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full border border-stone-800/20 pointer-events-none animate-[spin_120s_linear_infinite]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full border border-stone-800/10 pointer-events-none animate-[spin_90s_linear_infinite]" />

        <div className="relative w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-300">
          <Card className="border border-stone-800 bg-black/60 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="space-y-3 text-center pb-6 border-b border-stone-900">
              <div className="flex justify-center">
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-700/10 border border-emerald-500/30 shadow-inner">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
              <div className="space-y-1">
                <CardTitle className="text-2xl font-extrabold tracking-tight text-stone-100">
                  Verify Your Email
                </CardTitle>
                <CardDescription className="text-stone-400 text-sm">
                  We have sent a verification link to <span className="text-amber-500 font-semibold">{email}</span>.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6 text-center space-y-4">
              <p className="text-xs text-stone-400 leading-relaxed">
                Please click the link in your email to confirm your account and log into the Huzaifa Tailoring Management System.
              </p>
              <div className="pt-2">
                <Link href="/login" className="inline-block w-full">
                  <Button className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold tracking-wide rounded-lg transition-all duration-300">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-radial from-stone-900 via-neutral-950 to-neutral-950 px-4 py-12 overflow-hidden">
      {/* Abstract Design Elements representing tailoring */}
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
                JOIN HUZAIFA
              </CardTitle>
              <CardDescription className="text-stone-400 text-sm tracking-widest uppercase">
                Create Staff Account
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>{errors.general}</p>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-stone-300 text-xs font-semibold uppercase tracking-wider">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                    className={`pl-10 h-11 bg-stone-950/70 border-stone-800 text-stone-200 placeholder-stone-600 focus:border-amber-500/60 focus:ring-amber-500/20 rounded-lg transition-all ${
                      errors.fullName ? 'border-red-500/50 focus:border-red-500/60' : ''
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-red-400 text-[10px] flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
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
                    className={`pl-10 h-11 bg-stone-950/70 border-stone-800 text-stone-200 placeholder-stone-600 focus:border-amber-500/60 focus:ring-amber-500/20 rounded-lg transition-all ${
                      errors.email ? 'border-red-500/50 focus:border-red-500/60' : ''
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-[10px] flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-stone-300 text-xs font-semibold uppercase tracking-wider">
                  Password (min. 6 chars)
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
                    className={`pl-10 h-11 bg-stone-950/70 border-stone-800 text-stone-200 placeholder-stone-600 focus:border-amber-500/60 focus:ring-amber-500/20 rounded-lg transition-all ${
                      errors.password ? 'border-red-500/50 focus:border-red-500/60' : ''
                    }`}
                  />
                </div>
                {errors.password && (
                  <p className="text-red-400 text-[10px] flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-stone-300 text-xs font-semibold uppercase tracking-wider">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className={`pl-10 h-11 bg-stone-950/70 border-stone-800 text-stone-200 placeholder-stone-600 focus:border-amber-500/60 focus:ring-amber-500/20 rounded-lg transition-all ${
                      errors.confirmPassword ? 'border-red-500/50 focus:border-red-500/60' : ''
                    }`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-[10px] flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold tracking-wide rounded-lg transition-all duration-300 cursor-pointer shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                    Creating Account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>

              <div className="text-center text-xs text-stone-400 mt-4">
                Already have an account?{' '}
                <Link href="/login" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors hover:underline">
                  Sign In
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
