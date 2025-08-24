'use client'

import { useEffect, useState } from 'react'
import { ContentGrid } from '@/components/content-grid'
import { SearchBar } from '@/components/search-bar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTitles, Title } from '@/hooks/use-titles'
import { Flame, TrendingUp, Clock, Star } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  const [featuredTitles, setFeaturedTitles] = useState<Title[]>([])
  const { titles: latestTitles, loading: latestLoading } = useTitles({ 
    status: 'published', 
    limit: 12 
  })
  const { titles: trendingTitles, loading: trendingLoading } = useTitles({ 
    status: 'published', 
    limit: 12 
  })

  // Get featured content
  useEffect(() => {
    if (latestTitles.length > 0) {
      setFeaturedTitles(latestTitles.filter(t => t.featured).slice(0, 5))
    }
  }, [latestTitles])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="text-2xl font-bold">
              StreamVault
            </Link>
            
            <div className="flex items-center gap-4">
              <Link href="/browse">
                <Button variant="ghost">Browse</Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline">Admin Panel</Button>
              </Link>
            </div>
          </div>

          <SearchBar 
            placeholder="Search for movies, series, actors..."
            showFilters={true}
          />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section - Featured Content */}
        {featuredTitles.length > 0 && (
          <section>
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-black/50 to-transparent">
              {featuredTitles[0].backdrop_url && (
                <div className="absolute inset-0">
                  <Image
                    src={featuredTitles[0].backdrop_url}
                    alt={featuredTitles[0].title}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                </div>
              )}
              
              <div className="relative p-8 md:p-12 max-w-2xl">
                <Badge className="mb-4 bg-red-600 hover:bg-red-700">
                  <Flame className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
                
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                  {featuredTitles[0].title}
                </h1>
                
                {featuredTitles[0].synopsis && (
                  <p className="text-lg text-white/90 mb-6 line-clamp-3">
                    {featuredTitles[0].synopsis}
                  </p>
                )}
                
                <div className="flex items-center gap-4 mb-6 text-white/80">
                  <span>{featuredTitles[0].year}</span>
                  {featuredTitles[0].internal_rating && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{featuredTitles[0].internal_rating.toFixed(1)}</span>
                      </div>
                    </>
                  )}
                  <span>•</span>
                  <Badge variant="outline" className="text-white border-white/30">
                    {featuredTitles[0].type === 'movie' ? 'Movie' : 'Series'}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {featuredTitles[0].genres.slice(0, 3).map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-4">
                  <Link href={`/title/${featuredTitles[0].slug}`}>
                    <Button size="lg" className="bg-white text-black hover:bg-white/90">
                      Watch Now
                    </Button>
                  </Link>
                  <Link href={`/title/${featuredTitles[0].slug}`}>
                    <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10">
                      More Info
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Content Sections */}
        <Tabs defaultValue="latest" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="latest" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Latest
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="featured" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Featured
            </TabsTrigger>
          </TabsList>

          <TabsContent value="latest" className="mt-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Latest Releases</h2>
                <Link href="/browse?sort=latest">
                  <Button variant="outline">View All</Button>
                </Link>
              </div>
              <ContentGrid 
                titles={latestTitles} 
                loading={latestLoading}
                emptyMessage="No latest content available"
              />
            </div>
          </TabsContent>

          <TabsContent value="trending" className="mt-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Trending Now</h2>
                <Link href="/browse?sort=trending">
                  <Button variant="outline">View All</Button>
                </Link>
              </div>
              <ContentGrid 
                titles={trendingTitles} 
                loading={trendingLoading}
                emptyMessage="No trending content available"
              />
            </div>
          </TabsContent>

          <TabsContent value="featured" className="mt-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Featured Content</h2>
                <Link href="/browse?featured=true">
                  <Button variant="outline">View All</Button>
                </Link>
              </div>
              <ContentGrid 
                titles={featuredTitles} 
                loading={false}
                emptyMessage="No featured content available"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Genre Shortcuts */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Browse by Genre</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Documentary'].map((genre) => (
              <Link key={genre} href={`/browse?genre=${genre.toLowerCase()}`}>
                <div className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors text-center">
                  <span className="font-medium">{genre}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">StreamVault</h3>
              <p className="text-sm text-muted-foreground">
                Your premium streaming destination for movies and series.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Browse</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/browse?type=movie" className="text-muted-foreground hover:text-foreground">Movies</Link></li>
                <li><Link href="/browse?type=series" className="text-muted-foreground hover:text-foreground">TV Series</Link></li>
                <li><Link href="/browse?sort=trending" className="text-muted-foreground hover:text-foreground">Trending</Link></li>
                <li><Link href="/browse?featured=true" className="text-muted-foreground hover:text-foreground">Featured</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Genres</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/browse?genre=action" className="text-muted-foreground hover:text-foreground">Action</Link></li>
                <li><Link href="/browse?genre=comedy" className="text-muted-foreground hover:text-foreground">Comedy</Link></li>
                <li><Link href="/browse?genre=drama" className="text-muted-foreground hover:text-foreground">Drama</Link></li>
                <li><Link href="/browse?genre=horror" className="text-muted-foreground hover:text-foreground">Horror</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Admin</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/admin" className="text-muted-foreground hover:text-foreground">Admin Panel</Link></li>
                <li><Link href="/admin/upload" className="text-muted-foreground hover:text-foreground">Upload Content</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2024 StreamVault. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}