import { createFileRoute } from '@tanstack/react-router';
import { PodcastForm } from '@/components/form-panel';
import { PreparationNotesDisplay } from '@/components/notes';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="max-w-[1400px] mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 min-h-[calc(100vh-9rem)]">
        <div className="lg:col-span-3">
          <PodcastForm />
        </div>
        <div className="lg:col-span-9 h-full overflow-hidden">
          <PreparationNotesDisplay />
        </div>
      </div>
    </div>
  );
}
