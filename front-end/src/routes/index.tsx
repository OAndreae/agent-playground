import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { PodcastForm } from '@/components/podcast-form'
import { ResultsDisplay } from '@/components/results-display'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)

  const handleFormSubmit = async (data: {
    guestSpeaker: string
    guestSpeakerBio: string
    audienceDescription: string
  }) => {
    setContent('')
    setIsLoading(true)
    setIsStreaming(false)

    // TODO: Implement API integration
    // Placeholder for demonstration
    console.log('Form submitted:', data)

    // Simulate initial loading
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulate streaming
    setIsStreaming(true)
    const mockContent = `# ${data.guestSpeaker}\n\n## Executive Summary\n\nThis is a placeholder for the streamed content. In the real implementation, this will be replaced with actual streaming data from your back-end API.\n\n## Key Talking Points\n\n- Point 1\n- Point 2\n- Point 3\n\n## Suggested Questions\n\n1. Question 1?\n2. Question 2?\n3. Question 3?`

    // Simulate character-by-character streaming
    for (let i = 0; i < mockContent.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 10))
      setContent(mockContent.substring(0, i + 1))
    }

    setIsLoading(false)
    setIsStreaming(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Podcast Research Assistant
          </h1>
          <p className="text-muted-foreground">
            AI-powered interview preparation powered by Google Gemini
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          <div className="lg:sticky lg:top-8 h-fit">
            <PodcastForm onSubmit={handleFormSubmit} isLoading={isLoading || isStreaming} />
          </div>

          <div className="min-h-[600px]">
            <ResultsDisplay
              content={content}
              isLoading={isLoading}
              isStreaming={isStreaming}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
