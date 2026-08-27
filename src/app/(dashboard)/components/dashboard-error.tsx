'use client';

import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardErrorProps {
  message?: string;
  onRetry: () => void;
}

export default function DashboardError({
  message = 'Failed to load dashboard data.',
  onRetry,
}: DashboardErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-5 animate-in fade-in duration-300">
      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="text-center space-y-1.5 max-w-sm">
        <h2 className="text-base font-bold text-foreground">Something went wrong</h2>
        <p className="text-xs text-muted-foreground">{message}</p>
        <p className="text-[11px] text-muted-foreground/80">
          Please check your connection and try again.
        </p>
      </div>

      <Button
        onClick={onRetry}
        className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl h-10 px-5 cursor-pointer flex items-center gap-2 shadow-sm shadow-amber-500/10 transition-all text-xs"
      >
        <RefreshCcw className="w-3.5 h-3.5" />
        Retry Loading
      </Button>
    </div>
  );
}
