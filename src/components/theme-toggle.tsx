'use client';

import * as React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-secondary/50 border border-border animate-pulse" />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="relative h-9 w-9 rounded-xl border border-border bg-card/60 hover:bg-secondary text-foreground hover:text-amber-500 transition-all flex items-center justify-center cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-amber-400" />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl border-border bg-popover/95 backdrop-blur-xl p-1.5 shadow-xl min-w-[130px]">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={`flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
            theme === 'light' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold' : 'text-foreground hover:bg-secondary'
          }`}
        >
          <Sun className="h-3.5 w-3.5 text-amber-500" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
            theme === 'dark' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold' : 'text-foreground hover:bg-secondary'
          }`}
        >
          <Moon className="h-3.5 w-3.5 text-amber-400" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={`flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
            theme === 'system' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold' : 'text-foreground hover:bg-secondary'
          }`}
        >
          <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
