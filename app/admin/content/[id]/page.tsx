'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Save, 
  ArrowLeft, 
  Eye, 
  Upload, 
  Plus, 
  X,
  Star,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { generateSlug, GENRES } from '@/lib/utils'
import { toast } from 'sonner'

interface Episode {
  id: string
  season_number: number
  episode_number: number
  episode_title: string
  synopsis: string
  duration_minutes: number
  status: string
}

export default function AdminEditContentPage() {
  const params = useParams()
  const router = useRouter()
  const titleId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState<any>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
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
    status: 'draft' as 'draft' | 'published' | 'processing',
    poster_url: '',
    backdrop_url: ''
  })

  const [castInput, setCastInput] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [newEpisode, setNewEpisode] = useState({
    season_number: 1,
    episode_number: 1,
    episode_title: '',
    synopsis: '',
    duration_minutes: '',
    status: 'draft'
  })

  useEffect(() => {
    if (titleId) {
      fetchTitle()
    }
  }, [titleId])

  const fetchTitle = async () => {
    try {
      setLoading(true)
      
      // Fetch title
      const { data: titleData, error: titleError } = await supabase
        .from('titles')
        .select('*')
        .eq('id', titleId)
        .single()

      if (titleError) throw titleError

      setTitle(titleData)
      setFormData({
        title: titleData.title,
        slug: titleData.slug,
        type: titleData.type,
        synopsis: titleData.synopsis || '',
        year: titleData.year || new Date().getFullYear(),
        country: titleData.country || '',
        genres: titleData.genres || [],
        cast_members: titleData.cast_members || [],
        tags: titleData.tags || [],
        internal_rating: titleData.internal_rating?.toString() || '',
        duration_minutes: titleData.duration_minutes?.toString() || '',
        trailer_url: titleData.trailer_url || '',
        trailer_type: titleData.trailer_type || 'youtube',
        featured: titleData.featured || false,
        status: titleData.status,
        poster_url: titleData.poster_url || '',
        backdrop_url: titleData.backdrop_url || ''
      })

      // Fetch episodes if series
      if (titleData.type === 'series') {
        const { data: episodesData, error: episodesError } = await supabase
          .from('episodes')
          .select('*')
          .eq('title_id', titleId)
          .order('season_number')
          .order('episode_number')

        if (episodesError) throw episodesError
        setEpisodes(episodesData || [])
      }
    } catch (err) {
      console.error('Error fetching title:', err)
      toast.error('Failed to load content')
      router.push('/admin/content')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'title' ? { slug: generateSlug(value) } : {})
    }))
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

  const handleSave = async () => {
    try {
      setSaving(true)

      const updateData = {
        title: formData.title,
        slug: formData.slug,
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
        status: formData.status,
        poster_url: formData.poster_url || null,
        backdrop_url: formData.backdrop_url || null,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('titles')
        .update(updateData)
        .eq('id', titleId)

      if (error) throw error

      toast.success('Content updated successfully')
      fetchTitle() // Refresh data
    } catch (err) {
      console.error('Error updating title:', err)
      toast.error('Failed to update content')
    } finally {
      setSaving(false)
    }
  }

  const addEpisode = async () => {
    try {
      const episodeData = {
        title_id: titleId,
        season_number: newEpisode.season_number,
        episode_number: newEpisode.episode_number,
        episode_title: newEpisode.episode_title || null,
        synopsis: newEpisode.synopsis || null,
        duration_minutes: newEpisode.duration_minutes ? parseInt(newEpisode.duration_minutes) : null,
        status: newEpisode.status
      }

      const { error } = await supabase
        .from('episodes')
        .insert(episodeData)

      if (error) throw error

      toast.success('Episode added successfully')
      setNewEpisode({
        season_number: 1,
        episode_number: 1,
        episode_title: '',
        synopsis: '',
        duration_minutes: '',
        status: 'draft'
      })
      fetchTitle() // Refresh episodes
    } catch (err) {
      console.error('Error adding episode:', err)
      toast.error('Failed to add episode')
    }
  }

  const deleteEpisode = async (episodeId: string) => {
    try {
      const { error } = await supabase
        .from('episodes')
        .delete()
        .eq('id', episodeId)

      if (error) throw error

      toast.success('Episode deleted successfully')
      fetchTitle() // Refresh episodes
    } catch (err) {
      console.error('Error deleting episode:', err)
      toast.error('Failed to delete episode')
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!title) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
          <Link href="/admin/content">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Content
            </Button>
          </Link>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/content">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Edit Content</h1>
              <p className="text-muted-foreground">
                {formData.title || 'Untitled'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href={`/title/${formData.slug}`}>
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </Link>
            
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            {formData.type === 'series' && (
              <TabsTrigger value="episodes">Episodes</TabsTrigger>
            )}
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="synopsis">Synopsis</Label>
                  <Textarea
                    id="synopsis"
                    value={formData.synopsis}
                    onChange={(e) => handleInputChange('synopsis', e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Type</Label>
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
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => handleInputChange('featured', checked)}
                    />
                    <Label htmlFor="featured">Featured content</Label>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
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
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => handleInputChange('duration_minutes', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="rating">Internal Rating (0-10)</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.internal_rating}
                    onChange={(e) => handleInputChange('internal_rating', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metadata Tab */}
          <TabsContent value="metadata" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Genres</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {GENRES.map((genre) => (
                    <div key={genre} className="flex items-center space-x-2">
                      <Checkbox
                        id={`genre-${genre}`}
                        checked={formData.genres.includes(genre)}
                        onCheckedChange={() => toggleGenre(genre)}
                      />
                      <Label htmlFor={`genre-${genre}`} className="text-sm">
                        {genre}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-4">
                    {formData.genres.map((genre) => (
                      <Badge key={genre} variant="secondary">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cast Members</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
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
                  <div className="flex flex-wrap gap-2">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
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
                  <div className="flex flex-wrap gap-2">
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="poster">Poster URL</Label>
                  <Input
                    id="poster"
                    value={formData.poster_url}
                    onChange={(e) => handleInputChange('poster_url', e.target.value)}
                    placeholder="/images/MoviePoster.jpg"
                  />
                </div>

                <div>
                  <Label htmlFor="backdrop">Backdrop URL</Label>
                  <Input
                    id="backdrop"
                    value={formData.backdrop_url}
                    onChange={(e) => handleInputChange('backdrop_url', e.target.value)}
                    placeholder="/images/BackdropImage.jpg"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trailer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
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
                    value={formData.trailer_url}
                    onChange={(e) => handleInputChange('trailer_url', e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="flex-1"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Episodes Tab */}
          {formData.type === 'series' && (
            <TabsContent value="episodes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Episode</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <Label>Season</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newEpisode.season_number}
                        onChange={(e) => setNewEpisode(prev => ({
                          ...prev,
                          season_number: parseInt(e.target.value)
                        }))}
                      />
                    </div>
                    <div>
                      <Label>Episode</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newEpisode.episode_number}
                        onChange={(e) => setNewEpisode(prev => ({
                          ...prev,
                          episode_number: parseInt(e.target.value)
                        }))}
                      />
                    </div>
                    <div>
                      <Label>Duration (min)</Label>
                      <Input
                        type="number"
                        value={newEpisode.duration_minutes}
                        onChange={(e) => setNewEpisode(prev => ({
                          ...prev,
                          duration_minutes: e.target.value
                        }))}
                      />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select
                        value={newEpisode.status}
                        onValueChange={(value) => setNewEpisode(prev => ({
                          ...prev,
                          status: value
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Episode Title</Label>
                      <Input
                        value={newEpisode.episode_title}
                        onChange={(e) => setNewEpisode(prev => ({
                          ...prev,
                          episode_title: e.target.value
                        }))}
                        placeholder="Episode title (optional)"
                      />
                    </div>

                    <div>
                      <Label>Synopsis</Label>
                      <Textarea
                        value={newEpisode.synopsis}
                        onChange={(e) => setNewEpisode(prev => ({
                          ...prev,
                          synopsis: e.target.value
                        }))}
                        placeholder="Episode synopsis (optional)"
                        rows={3}
                      />
                    </div>

                    <Button onClick={addEpisode}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Episode
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Episodes ({episodes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {episodes.length > 0 ? (
                    <div className="space-y-2">
                      {episodes.map((episode) => (
                        <div
                          key={episode.id}
                          className="flex items-center justify-between p-3 border rounded"
                        >
                          <div>
                            <div className="font-medium">
                              S{episode.season_number}E{episode.episode_number}
                              {episode.episode_title && `: ${episode.episode_title}`}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <Badge variant={episode.status === 'published' ? 'default' : 'secondary'} className="mr-2">
                                {episode.status}
                              </Badge>
                              {episode.duration_minutes && `${episode.duration_minutes}min`}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteEpisode(episode.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No episodes added yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AdminLayout>
  )
}