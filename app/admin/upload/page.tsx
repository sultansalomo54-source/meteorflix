'use client'

import { useState } from 'react'
import { AdminLayout } from '@/components/admin-layout'
import { UploadDropzone } from '@/components/upload-dropzone'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useTitles } from '@/hooks/use-titles'
import { generateSlug, GENRES } from '@/lib/utils'
import { Plus, X, Upload, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function UploadPage() {
  const router = useRouter()
  const { createTitle } = useTitles({})
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'movie' as 'movie' | 'series',
    synopsis: '',
    year: new Date().getFullYear(),
    country: '',
    genres: [] as string[],
    cast_members: [] as string[],
    tags: [] as string[],
    internal_rating: '',
    duration_minutes: '',
    trailer_url: '',
    trailer_type: 'youtube' as 'youtube' | 'vimeo' | 'mp4',
    featured: false,
  })
  
  const [castInput, setCastInput] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [step, setStep] = useState<'metadata' | 'upload'>('metadata')
  const [createdTitleId, setCreatedTitleId] = useState<string | null>(null)

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addCastMember = () => {
    if (castInput.trim() && !formData.cast_members.includes(castInput.trim())) {
      setFormData(prev => ({
        ...prev,
        cast_members: [...prev.cast_members, castInput.trim()]
      }))
      setCastInput('')
    }
  }

  const removeCastMember = (member: string) => {
    setFormData(prev => ({
      ...prev,
      cast_members: prev.cast_members.filter(m => m !== member)
    }))
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const toggleGenre = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }))
  }

  const handleSubmitMetadata = async () => {
    try {
      if (!formData.title.trim()) {
        toast.error('Title is required')
        return
      }

      const titleData = {
        title: formData.title,
        slug: generateSlug(formData.title),
        type: formData.type,
        synopsis: formData.synopsis || null,
        year: formData.year,
        country: formData.country || null,
        genres: formData.genres,
        cast_members: formData.cast_members,
        tags: formData.tags,
        internal_rating: formData.internal_rating ? parseFloat(formData.internal_rating) : null,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        trailer_url: formData.trailer_url || null,
        trailer_type: formData.trailer_url ? formData.trailer_type : null,
        featured: formData.featured,
        status: 'draft' as const
      }

      const newTitle = await createTitle(titleData)
      setCreatedTitleId(newTitle.id)
      setStep('upload')
      toast.success('Title created successfully! Now upload your media files.')
    } catch (error) {
      console.error('Error creating title:', error)
      toast.error('Failed to create title')
    }
  }

  const handleUploadComplete = () => {
    toast.success('Upload completed! Your content will be processed shortly.')
    router.push('/admin/content')
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Upload Content</h1>
            <p className="text-muted-foreground">
              Add new movies or series to your streaming platform
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={step === 'metadata' ? 'default' : 'outline'}>
              1. Metadata
            </Badge>
            <Badge variant={step === 'upload' ? 'default' : 'outline'}>
              2. Upload Files
            </Badge>
          </div>
        </div>

        {/* Metadata Step */}
        {step === 'metadata' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter title..."
                  />
                </div>

                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="movie">Movie</SelectItem>
                      <SelectItem value="series">TV Series</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="synopsis">Synopsis</Label>
                  <Textarea
                    id="synopsis"
                    value={formData.synopsis}
                    onChange={(e) => handleInputChange('synopsis', e.target.value)}
                    placeholder="Enter plot summary..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                      min="1900"
                      max={new Date().getFullYear() + 5}
                    />
                  </div>

                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      placeholder="e.g., USA"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rating">Rating (0-10)</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={formData.internal_rating}
                      onChange={(e) => handleInputChange('internal_rating', e.target.value)}
                      placeholder="e.g., 8.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => handleInputChange('duration_minutes', e.target.value)}
                      placeholder="e.g., 120"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => handleInputChange('featured', checked)}
                  />
                  <Label htmlFor="featured">Featured content</Label>
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Genres */}
                <div>
                  <Label>Genres</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {GENRES.map((genre) => (
                      <div key={genre} className="flex items-center space-x-2">
                        <Checkbox
                          id={`genre-${genre}`}
                          checked={formData.genres.includes(genre)}
                          onCheckedChange={() => toggleGenre(genre)}
                        />
                        <Label 
                          htmlFor={`genre-${genre}`} 
                          className="text-sm font-normal"
                        >
                          {genre}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {formData.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.genres.map((genre) => (
                        <Badge key={genre} variant="secondary">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cast Members */}
                <div>
                  <Label>Cast Members</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={castInput}
                      onChange={(e) => setCastInput(e.target.value)}
                      placeholder="Enter actor name..."
                      onKeyPress={(e) => e.key === 'Enter' && addCastMember()}
                    />
                    <Button type="button" onClick={addCastMember}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.cast_members.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.cast_members.map((member) => (
                        <Badge key={member} variant="outline" className="pr-1">
                          {member}
                          <button
                            onClick={() => removeCastMember(member)}
                            className="ml-1 hover:bg-destructive/20 rounded-full"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <Label>Tags</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Enter tag..."
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button type="button" onClick={addTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="pr-1">
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:bg-destructive/20 rounded-full"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Trailer */}
                <div>
                  <Label htmlFor="trailer">Trailer URL (optional)</Label>
                  <div className="flex gap-2 mt-2">
                    <Select
                      value={formData.trailer_type}
                      onValueChange={(value) => handleInputChange('trailer_type', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="vimeo">Vimeo</SelectItem>
                        <SelectItem value="mp4">MP4</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="trailer"
                      value={formData.trailer_url}
                      onChange={(e) => handleInputChange('trailer_url', e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upload Step */}
        {step === 'upload' && createdTitleId && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Media Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UploadDropzone
                  titleId={createdTitleId}
                  onUploadComplete={handleUploadComplete}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/content')}
          >
            Cancel
          </Button>

          {step === 'metadata' && (
            <Button onClick={handleSubmitMetadata}>
              <Save className="mr-2 h-4 w-4" />
              Save & Continue
            </Button>
          )}

          {step === 'upload' && (
            <Button onClick={() => router.push('/admin/content')}>
              Skip Upload (Save Draft)
            </Button>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}