import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

interface PodcastFormProps {
  onSubmit: (data: {
    guestSpeaker: string
    guestSpeakerBio: string
    audienceDescription: string
  }) => void
  isLoading?: boolean
}

export function PodcastForm({ onSubmit, isLoading = false }: PodcastFormProps) {
  const [guestSpeaker, setGuestSpeaker] = useState('')
  const [guestSpeakerBio, setGuestSpeakerBio] = useState('')
  const [audienceDescription, setAudienceDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    onSubmit({
      guestSpeaker,
      guestSpeakerBio,
      audienceDescription,
    })
  }

  const isFormValid = guestSpeaker.trim() && guestSpeakerBio.trim() && audienceDescription.trim()

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle>Podcast Research Assistant</CardTitle>
            <CardDescription>Generate interview preparation materials</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="guest-speaker">Guest Speaker Name</Label>
            <Input
              id="guest-speaker"
              placeholder="e.g., Jane Smith"
              value={guestSpeaker}
              onChange={(e) => setGuestSpeaker(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guest-bio">Guest Description</Label>
            <Textarea
              id="guest-bio"
              placeholder="Provide a brief description to help identify the guest (e.g., 'AI researcher at Stanford', 'CEO of TechCorp')"
              value={guestSpeakerBio}
              onChange={(e) => setGuestSpeakerBio(e.target.value)}
              disabled={isLoading}
              rows={4}
              className="resize-none"
              required
            />
            <p className="text-xs text-muted-foreground">
              This helps the AI identify and research the correct person
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience">Target Audience</Label>
            <Textarea
              id="audience"
              placeholder="Describe your podcast audience (e.g., 'software developers interested in AI', 'entrepreneurs in the tech space')"
              value={audienceDescription}
              onChange={(e) => setAudienceDescription(e.target.value)}
              disabled={isLoading}
              rows={4}
              className="resize-none"
              required
            />
            <p className="text-xs text-muted-foreground">
              Content will be tailored to this audience
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!isFormValid || isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <span className="animate-pulse">Researching...</span>
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Research
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
