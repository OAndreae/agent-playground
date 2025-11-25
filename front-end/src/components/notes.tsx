import { AlertCircle, FileText, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePodcastStore } from '@/store/store';
import { useStreaming } from '@/lib/use-streaming';

export function PreparationNotesDisplay() {
  const { streamResponse, isGenerating, setIsGenerating, setPreparationNotes, setError } = usePodcastStore();
  const { data, isStreaming, error: streamError, isComplete } = useStreaming(streamResponse);

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
      <Card className="h-full flex flex-col shadow-sm py-0">
        {!data && !isGenerating && !isStreaming && !streamError ? (
          <div className="h-full px-6 flex flex-col items-center justify-center text-muted-foreground">
            <FileText className="h-12 w-12 mb-4 opacity-40" />
            <p className="text-sm font-medium">No research brief generated</p>
            <p className="text-xs mt-2 text-center max-w-sm">
              Enter guest details in the form and click "Generate Research Brief" to get started
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full rounded-lg p-6">
            {streamError ? (
              <div className="flex flex-col items-center justify-center h-full text-destructive">
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
                  <div className="prose prose-sm prose-slate w-full min-w-0 max-w-full wrap-break-word dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{data}</ReactMarkdown>
                  </div>
                )}
              </div>
            ) : (
              <div className="prose prose-sm prose-slate w-full min-w-0 max-w-full wrap-break-word dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{data}</ReactMarkdown>
              </div>
            )}
          </ScrollArea>
        )}
      </Card>
  );
}
