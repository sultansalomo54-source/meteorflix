'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ContentGrid } from '@/components/content-grid'
import { SearchBar } from '@/components/search-bar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  Clock,
  TrendingUp,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Title } from '@/hooks/use-titles'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const [results, setResults] = useState<Title[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState('all')
  
  const [searchFilters, setSearchFilters] = useState({
    type: '',
    genres: [] as string[],
    year: '',
    minRating: 0
  })

  useEffect(() => {
    if (query) {
      performSearch()
    }
  }, [query, searchFilters, currentPage, activeTab])

  const performSearch = async () => {
    try {
      setLoading(true)
      
      let searchQuery = supabase
        .from('titles')
        .select('*', { count: 'exact' })
        .eq('status', 'published')

      // Text search
      if (query) {
        searchQuery = searchQuery.or(
          `title.ilike.%${query}%,synopsis.ilike.%${query}%,cast_members.cs.{${query}},tags.cs.{${query}}`
        )
      }

      // Type filter
      if (activeTab !== 'all') {
        searchQuery = searchQuery.eq('type', activeTab)
      }

      // Additional filters
      if (searchFilters.type && searchFilters.type !== 'all') {
        searchQuery = searchQuery.eq('type', searchFilters.type)
      }

      if (searchFilters.genres.length > 0) {
        searchQuery = searchQuery.overlaps('genres', searchFilters.genres)
      }

      if (searchFilters.year) {
        searchQuery = searchQuery.eq('year', parseInt(searchFilters.year))
      }

      if (searchFilters.minRating > 0) {
        searchQuery = searchQuery.gte('internal_rating', searchFilters.minRating)
      }

      // Pagination
      const limit = 20
      const from = (currentPage - 1) * limit
      const to = from + limit - 1

      const { data, error, count } = await searchQuery
        .range(from, to)
        .order('views_count', { ascending: false })

      if (error) throw error

      setResults(data || [])
      setTotalCount(count || 0)
    } catch (err) {
      console.error('Search error:', err)
      setResults([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (newQuery: string, filters: any) => {
    // This would update the URL and trigger a new search
    window.history.pushState({}, '', `/search?q=${encodeURIComponent(newQuery)}`)
  }

  const clearSearch = () => {
    setResults([])
    setTotalCount(0)
    window.history.pushState({}, '', '/search')
  }

  const movieResults = results.filter(r => r.type === 'movie')
  const seriesResults = results.filter(r => r.type === 'series')

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
            onSearch={handleSearch}
            placeholder="Search for movies, series, actors..."
            showFilters={true}
          />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search Results Header */}
        <div className="mb-8">
          {query ? (
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Search Results for "{query}"
              </h1>
              <p className="text-muted-foreground">
                Found {totalCount} results
              </p>
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-bold mb-2">Search</h1>
              <p className="text-muted-foreground">
                Enter a search term to find movies and series
              </p>
            </div>
          )}
        </div>

        {/* No Query State */}
        {!query && (
          <div className="space-y-8">
            {/* Popular Searches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Popular Searches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Romance'].map((term) => (
                    <Button
                      key={term}
                      variant="outline"
                      size="sm"
                      onClick={() => window.history.pushState({}, '', `/search?q=${term}`)}
                    >
                      {term}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Searches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Browse Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/browse?type=movie">
                    <Card className="cursor-pointer hover:bg-accent">
                      <CardContent className="p-4 text-center">
                        <h3 className="font-semibold">Movies</h3>
                        <p className="text-sm text-muted-foreground">Browse all movies</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/browse?type=series">
                    <Card className="cursor-pointer hover:bg-accent">
                      <CardContent className="p-4 text-center">
                        <h3 className="font-semibold">TV Series</h3>
                        <p className="text-sm text-muted-foreground">Browse all series</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/browse?featured=true">
                    <Card className="cursor-pointer hover:bg-accent">
                      <CardContent className="p-4 text-center">
                        <h3 className="font-semibold">Featured</h3>
                        <p className="text-sm text-muted-foreground">Curated content</p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search Results */}
        {query && (
          <div className="space-y-6">
            {/* Result Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">
                  All ({totalCount})
                </TabsTrigger>
                <TabsTrigger value="movie">
                  Movies ({movieResults.length})
                </TabsTrigger>
                <TabsTrigger value="series">
                  Series ({seriesResults.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <ContentGrid 
                  titles={results} 
                  loading={loading}
                  emptyMessage={`No results found for "${query}"`}
                />
              </TabsContent>

              <TabsContent value="movie" className="mt-6">
                <ContentGrid 
                  titles={movieResults} 
                  loading={loading}
                  emptyMessage={`No movies found for "${query}"`}
                />
              </TabsContent>

              <TabsContent value="series" className="mt-6">
                <ContentGrid 
                  titles={seriesResults} 
                  loading={loading}
                  emptyMessage={`No series found for "${query}"`}
                />
              </TabsContent>
            </Tabs>

            {/* Load More / Pagination */}
            {totalCount > results.length && (
              <div className="text-center">
                <Button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More Results'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {query && !loading && results.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground mb-6">
              We couldn't find anything matching "{query}". Try different keywords or browse our catalog.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={clearSearch}>Clear Search</Button>
              <Link href="/browse">
                <Button variant="outline">Browse All Content</Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}