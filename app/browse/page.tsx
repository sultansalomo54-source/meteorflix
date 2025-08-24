'use client'

import { useState, useEffect } from 'react'
import { ContentGrid } from '@/components/content-grid'
import { SearchBar } from '@/components/search-bar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTitles } from '@/hooks/use-titles'
import { GENRES } from '@/lib/utils'
import { Filter, Grid, List, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function BrowsePage() {
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('latest')
  const [currentPage, setCurrentPage] = useState(1)
  
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || 'all',
    genre: searchParams.get('genre') || '',
    year: searchParams.get('year') || '',
    featured: searchParams.get('featured') === 'true'
  })

  const { titles, loading, totalPages, totalCount } = useTitles({
    status: 'published',
    type: filters.type === 'all' ? undefined : filters.type,
    genre: filters.genre || undefined,
    page: currentPage,
    limit: 24
  })

  // Sort titles based on sortBy
  const sortedTitles = [...titles].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'title':
        return a.title.localeCompare(b.title)
      case 'year':
        return (b.year || 0) - (a.year || 0)
      case 'rating':
        return (b.internal_rating || 0) - (a.internal_rating || 0)
      case 'views':
        return b.views_count - a.views_count
      default:
        return 0
    }
  })

  // Filter by additional criteria
  const filteredTitles = sortedTitles.filter(title => {
    if (filters.featured && !title.featured) return false
    if (filters.year && title.year?.toString() !== filters.year) return false
    return true
  })

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({ type: 'all', genre: '', year: '', featured: false })
    setCurrentPage(1)
  }

  const hasActiveFilters = filters.type !== 'all' || filters.genre || filters.year || filters.featured

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

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
              <Link href="/">
                <Button variant="ghost">Home</Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline">Admin Panel</Button>
              </Link>
            </div>
          </div>

          <SearchBar 
            placeholder="Search content..."
            showFilters={false}
          />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Browse Content</h1>
            <p className="text-muted-foreground">
              Discover {totalCount} movies and series
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="year">Year</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="views">Most Viewed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Content Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Content Type</label>
                  <Select
                    value={filters.type}
                    onValueChange={(value) => handleFilterChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="movie">Movies</SelectItem>
                      <SelectItem value="series">TV Series</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Genre */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Genre</label>
                  <Select
                    value={filters.genre}
                    onValueChange={(value) => handleFilterChange('genre', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Genres" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Genres</SelectItem>
                      {GENRES.map((genre) => (
                        <SelectItem key={genre} value={genre.toLowerCase()}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Year */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Release Year</label>
                  <Select
                    value={filters.year}
                    onValueChange={(value) => handleFilterChange('year', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Years</SelectItem>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Featured Only</label>
                  <Button
                    variant={filters.featured ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('featured', !filters.featured)}
                  >
                    {filters.featured ? 'ON' : 'OFF'}
                  </Button>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Clear All Filters
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Quick Genre Links */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Popular Genres</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance'].map((genre) => (
                    <Button
                      key={genre}
                      variant="outline"
                      size="sm"
                      onClick={() => handleFilterChange('genre', genre.toLowerCase())}
                      className="justify-start"
                    >
                      {genre}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {filters.type !== 'all' && (
                    <Badge variant="secondary">
                      Type: {filters.type}
                    </Badge>
                  )}
                  {filters.genre && (
                    <Badge variant="secondary">
                      Genre: {filters.genre}
                    </Badge>
                  )}
                  {filters.year && (
                    <Badge variant="secondary">
                      Year: {filters.year}
                    </Badge>
                  )}
                  {filters.featured && (
                    <Badge variant="secondary">
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {filteredTitles.length} of {totalCount} results
              </p>
            </div>

            {/* Content Grid */}
            <ContentGrid 
              titles={filteredTitles} 
              loading={loading}
              emptyMessage="No content found matching your filters"
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12 gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Previous
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                  if (page > totalPages) return null
                  
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  )
                })}
                
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}