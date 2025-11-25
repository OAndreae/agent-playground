import { AlertCircle, Lightbulb, RotateCcw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePodcastStore } from '@/store/store';
import { ApiError, startResearch } from '@/lib/api-client';

export function PodcastForm() {
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
    setStreamResponse,
  } = usePodcastStore();

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!guestName.trim()) {
      errors.guestName = 'Guest name is required';
    }

    if (!guestBio.trim()) {
      errors.guestBio = 'Guest description is required';
    } else if (guestBio.trim().length < 10) {
      errors.guestBio = 'Please provide a more detailed description (at least 10 characters)';
    } else if (guestBio.trim().length > 250) {
      errors.guestBio = 'Description must not exceed 250 characters';
    }

    if (!audienceProfile.trim()) {
      errors.audienceProfile = 'Audience profile is required';
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
      const response = await startResearch({
        guestSpeaker: guestName,
        speakerDescription: guestBio,
        audience: audienceProfile,
      });

      setStreamResponse(response);
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

  const handleFillDefaults = () => {
    updateField('guestName', 'Brian Chesky');
    updateField('guestBio', 'Co-founder of AirBnB');
    updateField('audienceProfile', 'Prospective clients and employees of a leading investment bank.');
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
    <Card className="py-0 shadow-sm flex flex-col">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900 text-sm tracking-wide uppercase">
          Guest Information
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleFillDefaults}
          disabled={isGenerating}
          className="text-muted-foreground hover:text-foreground"
          title="Fill with example data"
        >
          <Lightbulb className="h-4 w-4" />
        </Button>
      </div>
      <CardContent className="flex-1 px-5 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guestName" className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
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
            <Label htmlFor="guestBio" className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
              Role / Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="guestBio"
              placeholder="Title, company, relevant context..."
              value={guestBio}
              onChange={(e) => handleFieldChange('guestBio', e.target.value)}
              disabled={isGenerating}
              rows={3}
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
            <Label htmlFor="audienceProfile" className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
              Audience Profile <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="audienceProfile"
              placeholder="Demographics, interests, knowledge level, expectations..."
              value={audienceProfile}
              onChange={(e) => handleFieldChange('audienceProfile', e.target.value)}
              disabled={isGenerating}
              rows={3}
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

          <div className="flex flex-col gap-3 pt-2">
            <Button
              type="submit"
              disabled={isGenerating}
              className="flex-1 bg-slate-900 hover:bg-slate-800"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Research Brief
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
              Clear Form
            </Button>
          </div>
        </form>
      </CardContent>
      <div className="px-5 py-4 bg-slate-50 border-t border-slate-100">
        <div className="flex gap-3">
          <AlertCircle className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            Research briefs are generated using publicly available information. Content should be reviewed for compliance before external distribution.
          </p>
        </div>
      </div>
    </Card>
  );
}
