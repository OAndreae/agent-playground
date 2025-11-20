import { createFileRoute } from '@tanstack/react-router';
import { FiresideChatForm } from '@/components/FiresideChatForm';
import { PreparationNotesDisplay } from '@/components/PreparationNotesDisplay';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
        <div className="h-full overflow-hidden">
          <FiresideChatForm />
        </div>
        <div className="h-full overflow-hidden">
          <PreparationNotesDisplay />
        </div>
      </div>
    </div>
  );
}
