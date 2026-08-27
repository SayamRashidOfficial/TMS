import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-950 text-stone-100 gap-6">
      <div className="text-center space-y-3">
        <p className="text-8xl font-extrabold text-amber-500">404</p>
        <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
        <p className="text-stone-400 text-sm max-w-xs">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
      <Link href="/">
        <Button className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl h-11 px-6 cursor-pointer flex items-center gap-2 shadow-lg shadow-amber-500/10 transition-all">
          <Home className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}
