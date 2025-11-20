import { AlertCircle, RotateCcw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFiresideChatStore } from '@/store/store';
import { ApiError, createSession } from '@/lib/api-client';

export function FiresideChatForm() {
  const {
    guestName,
    guestBio,
    audienceProfile,
    isGenerating,
    error,
    updateField,
    clearForm,
    setIsGenerating: setGenerating,
    setError,
    setSessionId,
  } = useFiresideChatStore();

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!guestName.trim()) {
      errors.guestName = 'Guest name is required';
    }

    if (!guestBio.trim()) {
      errors.guestBio = 'Guest description is required';
    } else if (guestBio.trim().length < 20) {
      errors.guestBio = 'Please provide a more detailed description (at least 20 characters)';
    }

    if (!audienceProfile.trim()) {
      errors.audienceProfile = 'Audience profile is required';
    } else if (audienceProfile.trim().length < 20) {
      errors.audienceProfile = 'Please provide a more detailed audience profile (at least 20 characters)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await createSession({
        guest_speaker: guestName,
        guest_speaker_bio: guestBio,
        audience_description: audienceProfile,
      });

      setSessionId(response.session_id);
    } catch (err) {
      setGenerating(false);

      if (err instanceof ApiError) {
        setError(err.detail || err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleClear = () => {
    clearForm();
    setValidationErrors({});
  };

  const handleFieldChange = (field: 'guestName' | 'guestBio' | 'audienceProfile', value: string) => {
    updateField(field, value);
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Event Details</CardTitle>
        <CardDescription>
          Provide information about your guest speaker and audience to generate preparation notes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="guestName">
              Guest Speaker Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="guestName"
              placeholder="e.g., Dr. Jane Smith"
              value={guestName}
              onChange={(e) => handleFieldChange('guestName', e.target.value)}
              disabled={isGenerating}
              className={validationErrors.guestName ? 'border-destructive' : ''}
            />
            {validationErrors.guestName && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.guestName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestBio">
              Guest Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="guestBio"
              placeholder="Provide a brief description to help identify the guest speaker (background, expertise, notable achievements, etc.)"
              value={guestBio}
              onChange={(e) => handleFieldChange('guestBio', e.target.value)}
              disabled={isGenerating}
              rows={5}
              className={validationErrors.guestBio ? 'border-destructive' : ''}
            />
            {validationErrors.guestBio && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.guestBio}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="audienceProfile">
              Audience Profile <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="audienceProfile"
              placeholder="Describe your audience (demographics, interests, knowledge level, expectations, etc.)"
              value={audienceProfile}
              onChange={(e) => handleFieldChange('audienceProfile', e.target.value)}
              disabled={isGenerating}
              rows={5}
              className={validationErrors.audienceProfile ? 'border-destructive' : ''}
            />
            {validationErrors.audienceProfile && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.audienceProfile}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-muted p-3 text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Preparation Notes
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              disabled={isGenerating}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
