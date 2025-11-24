import { createFileRoute } from '@tanstack/react-router';
import { PodcastForm } from '@/components/form-panel';
import { PreparationNotesDisplay } from '@/components/notes';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-9rem)]">
        <div className="lg:col-span-1 h-full overflow-hidden">
          <PodcastForm />
        </div>
        <div className="lg:col-span-2 h-full overflow-hidden">
          <PreparationNotesDisplay />
        </div>
      </div>
    </div>
  );
}
