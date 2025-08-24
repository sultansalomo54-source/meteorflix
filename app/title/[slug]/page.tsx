'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTitle, Episode } from '@/hooks/use-titles'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, 
  Star, 
  Calendar, 
  Clock, 
  Users, 
  Globe,
  ArrowLeft,
  Share2,
  Heart,
  Bookmark
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatDuration, getYouTubeId, getVimeoId, createSessionId } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

export default function TitleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  const [titleData, setTitleData] = useState<any>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<number>(1)
  const [sessionId] = useState(() => createSessionId())

  useEffect(() => {
    if (slug) {
      fetchTitleBySlug()
    }
  }, [slug])

  const fetchTitleBySlug = async () => {
    try {
      setLoading(true)
      
      // Fetch title by slug
      const { data: title, error: titleError } = await supabase
        .from('titles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (titleError) throw titleError

      setTitleData(title)

      // Fetch episodes if it's a series
      if (title.type === 'series') {
        const { data: episodesData, error: episodesError } = await supabase
          .from('episodes')
          .select('*')
          .eq('title_id', title.id)
          .eq('status', 'published')
          .order('season_number')
          .order('episode_number')

        if (episodesError) throw episodesError
        setEpisodes(episodesData || [])
      }

      // Increment view count
      await supabase
        .from('titles')
        .update({ views_count: title.views_count + 1 })
        .eq('id', title.id)

      setError(null)
    } catch (err) {
      console.error('Error fetching title:', err)
      setError('Title not found')
    } finally {
      setLoading(false)
    }
  }

  const handleWatch = (episodeId?: string) => {
    if (episodeId) {
      router.push(`/watch/${titleData.id}?episode=${episodeId}&session=${sessionId}`)
    } else {
      router.push(`/watch/${titleData.id}?session=${sessionId}`)
    }
  }

  const getTrailerEmbedUrl = () => {
    if (!titleData?.trailer_url) return null
    
    switch (titleData.trailer_type) {
      case 'youtube':
        const ytId = getYouTubeId(titleData.trailer_url)
        return ytId ? `https://www.youtube.com/embed/${ytId}` : null
      case 'vimeo':
        const vimeoId = getVimeoId(titleData.trailer_url)
        return vimeoId ? `https://player.vimeo.com/video/${vimeoId}` : null
      case 'mp4':
        return titleData.trailer_url
      default:
        return null
    }
  }

  // Group episodes by season
  const episodesBySeason = episodes.reduce((acc, episode) => {
    if (!acc[episode.season_number]) {
      acc[episode.season_number] = []
    }
    acc[episode.season_number].push(episode)
    return acc
  }, {} as Record<number, Episode[]>)

  const seasons = Object.keys(episodesBySeason).map(Number).sort((a, b) => a - b)
  const currentSeasonEpisodes = episodesBySeason[selectedSeason] || []

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="aspect-video bg-muted rounded"></div>
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="aspect-[2/3] bg-muted rounded"></div>
                <div className="h-6 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !titleData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The content you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative">
        {titleData.backdrop_url && (
          <div className="absolute inset-0 z-0">
            <Image
              src={titleData.backdrop_url}
              alt={titleData.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
          </div>
        )}
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Navigation */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Link href="/" className="text-lg font-semibold text-white">
              StreamVault
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
            {/* Content Info */}
            <div className="lg:col-span-2 space-y-6 text-white">
              {/* Title and Meta */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {titleData.featured && (
                    <Badge className="bg-red-600 hover:bg-red-700">Featured</Badge>
                  )}
                  <Badge variant="outline" className="text-white border-white/30">
                    {titleData.type === 'movie' ? 'Movie' : 'TV Series'}
                  </Badge>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                  {titleData.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-white/80 mb-6">
                  {titleData.year && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{titleData.year}</span>
                    </div>
                  )}
                  
                  {titleData.duration_minutes && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(titleData.duration_minutes)}</span>
                    </div>
                  )}
                  
                  {titleData.internal_rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{titleData.internal_rating.toFixed(1)}</span>
                    </div>
                  )}
                  
                  {titleData.country && (
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      <span>{titleData.country}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{titleData.views_count.toLocaleString()} views</span>
                  </div>
                </div>
              </div>

              {/* Synopsis */}
              {titleData.synopsis && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">Synopsis</h3>
                  <p className="text-white/90 leading-relaxed">
                    {titleData.synopsis}
                  </p>
                </div>
              )}

              {/* Genres */}
              {titleData.genres.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {titleData.genres.map((genre: string) => (
                      <Badge key={genre} variant="secondary">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Cast */}
              {titleData.cast_members.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Cast</h3>
                  <p className="text-white/90">
                    {titleData.cast_members.join(', ')}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Button 
                  size="lg" 
                  onClick={() => handleWatch()}
                  className="bg-white text-black hover:bg-white/90"
                >
                  <Play className="w-5 h-5 mr-2 fill-current" />
                  {titleData.type === 'series' ? 'Start Watching' : 'Watch Now'}
                </Button>
                
                {getTrailerEmbedUrl() && (
                  <Button size="lg" variant="outline" className="text-white border-white/30">
                    <Play className="w-4 h-4 mr-2" />
                    Watch Trailer
                  </Button>
                )}
                
                <Button size="lg" variant="outline" className="text-white border-white/30">
                  <Bookmark className="w-4 h-4 mr-2" />
                  Add to Watchlist
                </Button>
                
                <Button size="lg" variant="outline" className="text-white border-white/30">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Poster */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="aspect-[2/3] relative rounded-lg overflow-hidden">
                  <Image
                    src={titleData.poster_url || '/images/placeholder.jpg'}
                    alt={titleData.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="episodes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            {titleData.type === 'series' && (
              <TabsTrigger value="episodes">Episodes</TabsTrigger>
            )}
            {getTrailerEmbedUrl() && (
              <TabsTrigger value="trailer">Trailer</TabsTrigger>
            )}
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          {/* Episodes Tab */}
          {titleData.type === 'series' && (
            <TabsContent value="episodes" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Episodes</CardTitle>
                    {seasons.length > 1 && (
                      <div className="flex gap-2">
                        {seasons.map((season) => (
                          <Button
                            key={season}
                            variant={selectedSeason === season ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedSeason(season)}
                          >
                            Season {season}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {currentSeasonEpisodes.map((episode, index) => (
                      <div 
                        key={episode.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer group"
                        onClick={() => handleWatch(episode.id)}
                      >
                        <div className="w-12 h-8 bg-muted rounded flex items-center justify-center text-sm font-medium">
                          {episode.episode_number}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">
                              {episode.episode_title || `Episode ${episode.episode_number}`}
                            </h4>
                            {episode.duration_minutes && (
                              <span className="text-sm text-muted-foreground">
                                {formatDuration(episode.duration_minutes)}
                              </span>
                            )}
                          </div>
                          {episode.synopsis && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {episode.synopsis}
                            </p>
                          )}
                        </div>
                        
                        <Button 
                          size="sm" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Trailer Tab */}
          {getTrailerEmbedUrl() && (
            <TabsContent value="trailer" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Trailer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video">
                    {titleData.trailer_type === 'mp4' ? (
                      <video
                        src={getTrailerEmbedUrl()!}
                        controls
                        className="w-full h-full rounded-lg"
                        poster={titleData.backdrop_url}
                      />
                    ) : (
                      <iframe
                        src={getTrailerEmbedUrl()!}
                        className="w-full h-full rounded-lg"
                        allowFullScreen
                        title="Trailer"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Details Tab */}
          <TabsContent value="details" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Release Year</h4>
                    <p className="text-muted-foreground">{titleData.year || 'Unknown'}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Country</h4>
                    <p className="text-muted-foreground">{titleData.country || 'Unknown'}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Duration</h4>
                    <p className="text-muted-foreground">
                      {titleData.duration_minutes ? formatDuration(titleData.duration_minutes) : 'Unknown'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Rating</h4>
                    <p className="text-muted-foreground">
                      {titleData.internal_rating ? `${titleData.internal_rating}/10` : 'Not rated'}
                    </p>
                  </div>
                </div>
                
                {titleData.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {titleData.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}