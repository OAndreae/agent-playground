import { AlertCircle, FileText, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFiresideChatStore } from '@/store/store';
import { useStreaming } from '@/lib/use-streaming';

export function PreparationNotesDisplay() {
  const { sessionId, isGenerating, setIsGenerating, setPreparationNotes, setError } = useFiresideChatStore();
  const { data, isStreaming, error: streamError, isComplete } = useStreaming(sessionId);

  useEffect(() => {
    if (data) {
      setPreparationNotes(data);
    }
  }, [data, setPreparationNotes]);

  useEffect(() => {
    if (streamError) {
      setError(streamError);
      setIsGenerating(false);
    }
  }, [streamError, setError, setIsGenerating]);

  useEffect(() => {
    if (isComplete) {
      setIsGenerating(false);
    }
  }, [isComplete, setIsGenerating]);

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
          {streamError ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-destructive">
              <AlertCircle className="h-12 w-12 mb-4" />
              <p className="text-sm font-medium">Error during streaming</p>
              <p className="text-xs mt-2 text-center max-w-sm">{streamError}</p>
            </div>
          ) : isGenerating || isStreaming ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p className="text-sm font-medium">Generating preparation notes...</p>
              </div>
              {data && (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="whitespace-pre-wrap">{data}</div>
                </div>
              )}
            </div>
          ) : data ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap">{data}</div>
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
