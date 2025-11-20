import { useFiresideChatStore } from '@/store/firesideChatStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Loader2 } from 'lucide-react';

export function PreparationNotesDisplay() {
  const { preparationNotes, isGenerating } = useFiresideChatStore();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Preparation Notes</CardTitle>
        <CardDescription>
          Generated notes and insights for your fireside chat
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full rounded-lg border bg-muted/30 p-6">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p className="text-sm font-medium">Generating preparation notes...</p>
              <p className="text-xs mt-2">This may take a few moments</p>
            </div>
          ) : preparationNotes ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap">{preparationNotes}</div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-40" />
              <p className="text-sm font-medium">Your preparation notes will appear here</p>
              <p className="text-xs mt-2 text-center max-w-sm">
                Fill out the form on the left and click "Generate Preparation Notes" to get started
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
