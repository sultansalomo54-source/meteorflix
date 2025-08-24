'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { VideoPlayer } from '@/components/ui/video-player'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ArrowLeft, 
  SkipForward, 
  SkipBack, 
  Settings,
  Maximize,
  Volume2
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatDuration } from '@/lib/utils'

interface WatchData {
  title: any
  episode?: any
  videoUrl?: string
  subtitles?: Array<{ lang: string, url: string }>
  nextEpisode?: any
  prevEpisode?: any
}

export default function WatchPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const titleId = params.id as string
  const episodeId = searchParams.get('episode')
  const sessionId = searchParams.get('session') || 'anonymous'
  
  const [watchData, setWatchData] = useState<WatchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentProgress, setCurrentProgress] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (titleId) {
      fetchWatchData()
      loadWatchProgress()
    }
  }, [titleId, episodeId])

  const fetchWatchData = async () => {
    try {
      setLoading(true)
      
      // Fetch title
      const { data: title, error: titleError } = await supabase
        .from('titles')
        .select('*')
        .eq('id', titleId)
        .single()

      if (titleError) throw titleError

      let episode = null
      let videoUrl = null
      let nextEpisode = null
      let prevEpisode = null

      if (episodeId) {
        // Fetch specific episode
        const { data: episodeData, error: episodeError } = await supabase
          .from('episodes')
          .select('*')
          .eq('id', episodeId)
          .single()

        if (episodeError) throw episodeError
        episode = episodeData

        // Find next and previous episodes
        const { data: allEpisodes } = await supabase
          .from('episodes')
          .select('*')
          .eq('title_id', titleId)
          .eq('status', 'published')
          .order('season_number')
          .order('episode_number')

        if (allEpisodes) {
          const currentIndex = allEpisodes.findIndex(ep => ep.id === episodeId)
          nextEpisode = allEpisodes[currentIndex + 1] || null
          prevEpisode = allEpisodes[currentIndex - 1] || null
        }
      }

      // For demo purposes, we'll use placeholder video URLs
      // In production, this would come from your video processing pipeline
      videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

      setWatchData({
        title,
        episode,
        videoUrl,
        nextEpisode,
        prevEpisode,
        subtitles: [] // Would be populated from assets table
      })

      setError(null)
    } catch (err) {
      console.error('Error fetching watch data:', err)
      setError('Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  const loadWatchProgress = async () => {
    try {
      const { data } = await supabase
        .from('watch_progress')
        .select('progress_seconds')
        .eq('session_id', sessionId)
        .eq('title_id', titleId)
        .eq('episode_id', episodeId || null)
        .single()

      if (data) {
        setCurrentProgress(data.progress_seconds)
      }
    } catch (err) {
      // No existing progress
    }
  }

  const saveWatchProgress = async (currentTime: number, duration: number) => {
    try {
      const progressData = {
        session_id: sessionId,
        title_id: titleId,
        episode_id: episodeId || null,
        progress_seconds: Math.floor(currentTime),
        duration_seconds: Math.floor(duration),
        completed: currentTime / duration > 0.9,
        last_watched: new Date().toISOString()
      }

      await supabase
        .from('watch_progress')
        .upsert(progressData, {
          onConflict: 'session_id,title_id,episode_id'
        })
    } catch (err) {
      console.error('Error saving progress:', err)
    }
  }

  const handleTimeUpdate = (currentTime: number, duration: number) => {
    // Save progress every 10 seconds
    if (Math.floor(currentTime) % 10 === 0) {
      saveWatchProgress(currentTime, duration)
    }
  }

  const navigateToEpisode = (episode: any) => {
    router.push(`/watch/${titleId}?episode=${episode.id}&session=${sessionId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (error || !watchData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Content Not Available</h1>
          <p className="text-gray-400 mb-6">{error}</p>
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

  const { title, episode, videoUrl, nextEpisode, prevEpisode } = watchData

  return (
    <div className="min-h-screen bg-black">
      {/* Video Player */}
      <div className="relative">
        <VideoPlayer
          src={videoUrl!}
          poster={episode?.thumbnail_url || title.backdrop_url}
          title={episode ? `${title.title} - S${episode.season_number}E${episode.episode_number}` : title.title}
          onTimeUpdate={handleTimeUpdate}
          initialTime={currentProgress}
          className="w-full h-screen"
        />

        {/* Back Button */}
        <div className="absolute top-4 left-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/50 text-white hover:bg-black/70"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Title Info Overlay */}
        <div className="absolute bottom-20 left-6 right-6 z-40 text-white">
          <div className="max-w-2xl">
            <h1 className="text-2xl md:text-4xl font-bold mb-2">
              {title.title}
            </h1>
            {episode && (
              <div className="flex items-center gap-4 mb-2">
                <Badge variant="outline" className="text-white border-white/30">
                  Season {episode.season_number}
                </Badge>
                <span className="text-lg">Episode {episode.episode_number}</span>
                {episode.episode_title && (
                  <>
                    <span>•</span>
                    <span className="text-lg">{episode.episode_title}</span>
                  </>
                )}
              </div>
            )}
            {episode?.synopsis && (
              <p className="text-white/90 text-sm line-clamp-2 max-w-lg">
                {episode.synopsis}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Episode Navigation */}
      {(nextEpisode || prevEpisode) && (
        <div className="bg-gray-900 border-t border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {prevEpisode && (
                  <Button
                    variant="outline"
                    onClick={() => navigateToEpisode(prevEpisode)}
                    className="text-white border-gray-600 hover:bg-gray-800"
                  >
                    <SkipBack className="w-4 h-4 mr-2" />
                    Previous Episode
                  </Button>
                )}
              </div>

              <div className="text-center text-white">
                <p className="text-sm text-gray-400">Currently Watching</p>
                <p className="font-medium">
                  S{episode?.season_number}E{episode?.episode_number}: {episode?.episode_title}
                </p>
              </div>

              <div className="flex items-center gap-4">
                {nextEpisode && (
                  <Button
                    onClick={() => navigateToEpisode(nextEpisode)}
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    Next Episode
                    <SkipForward className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Up Next Section */}
      {nextEpisode && (
        <div className="bg-gray-900 border-t border-gray-800">
          <div className="container mx-auto px-4 py-6">
            <h3 className="text-white text-lg font-semibold mb-4">Up Next</h3>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-32 h-18 bg-gray-700 rounded flex items-center justify-center">
                    <span className="text-white text-sm">
                      S{nextEpisode.season_number}E{nextEpisode.episode_number}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium">
                      {nextEpisode.episode_title || `Episode ${nextEpisode.episode_number}`}
                    </h4>
                    {nextEpisode.synopsis && (
                      <p className="text-gray-400 text-sm line-clamp-2 mt-1">
                        {nextEpisode.synopsis}
                      </p>
                    )}
                    {nextEpisode.duration_minutes && (
                      <p className="text-gray-500 text-xs mt-1">
                        {formatDuration(nextEpisode.duration_minutes)}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => navigateToEpisode(nextEpisode)}
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    Play
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}