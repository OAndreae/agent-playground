import { MessageCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Fireside Chat Preparation
          </h1>
        </div>
      </div>
      <Separator />
    </header>
  );
}
