'use client'

import { useState } from 'react'
import { AdminLayout } from '@/components/admin-layout'
import { ContentGrid } from '@/components/content-grid'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  Filter,
  MoreHorizontal,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { useTitles } from '@/hooks/use-titles'
import { formatDuration, GENRES } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function AdminContentPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  const { titles, loading, refetch } = useTitles({
    status: statusFilter === 'all' ? undefined : statusFilter,
    type: typeFilter === 'all' ? undefined : typeFilter,
    search: searchQuery || undefined,
    sortBy,
    sortOrder
  })

  const filteredTitles = titles.filter(title =>
    !searchQuery || 
    title.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    title.synopsis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    title.cast_members.some(cast => cast.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleDelete = async (titleId: string) => {
    try {
      const { error } = await supabase
        .from('titles')
        .delete()
        .eq('id', titleId)

      if (error) throw error

      toast.success('Content deleted successfully')
      refetch()
    } catch (err) {
      console.error('Error deleting title:', err)
      toast.error('Failed to delete content')
    }
  }

  const handleBulkAction = async (action: 'delete' | 'publish' | 'unpublish') => {
    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('titles')
          .delete()
          .in('id', selectedIds)

        if (error) throw error
        toast.success(`${selectedIds.length} items deleted`)
      } else {
        const status = action === 'publish' ? 'published' : 'draft'
        const { error } = await supabase
          .from('titles')
          .update({ status })
          .in('id', selectedIds)

        if (error) throw error
        toast.success(`${selectedIds.length} items ${action}ed`)
      }

      setSelectedIds([])
      refetch()
    } catch (err) {
      console.error(`Error performing bulk ${action}:`, err)
      toast.error(`Failed to ${action} selected items`)
    }
  }

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTitles.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredTitles.map(title => title.id))
    }
  }

  const stats = {
    total: titles.length,
    published: titles.filter(t => t.status === 'published').length,
    draft: titles.filter(t => t.status === 'draft').length,
    processing: titles.filter(t => t.status === 'processing').length,
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Content Management</h1>
            <p className="text-muted-foreground">
              Manage all movies and series in your library
            </p>
          </div>
          
          <Link href="/admin/upload">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Content
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.published}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.processing}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="movie">Movies</SelectItem>
                  <SelectItem value="series">Series</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date Created</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                  <SelectItem value="views_count">Views</SelectItem>
                  <SelectItem value="internal_rating">Rating</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {selectedIds.length} item(s) selected
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBulkAction('publish')}
                  >
                    Publish Selected
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBulkAction('unpublish')}
                  >
                    Unpublish Selected
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete Selected
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedIds.length} items?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. The selected content will be permanently deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleBulkAction('delete')}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                All Content ({filteredTitles.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAll}
                >
                  {selectedIds.length === filteredTitles.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                    <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                    <div className="w-16 h-10 bg-muted rounded animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredTitles.length > 0 ? (
              <div className="space-y-2">
                {filteredTitles.map((title) => (
                  <div
                    key={title.id}
                    className={`flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 ${
                      selectedIds.includes(title.id) ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(title.id)}
                      onChange={() => toggleSelection(title.id)}
                      className="w-4 h-4"
                    />
                    
                    <div className="w-16 h-10 bg-muted rounded flex items-center justify-center overflow-hidden">
                      {title.poster_url ? (
                        <img 
                          src={title.poster_url} 
                          alt={title.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-medium">
                          {title.type === 'movie' ? 'M' : 'S'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{title.title}</h4>
                        {title.featured && <Star className="h-4 w-4 text-yellow-500" />}
                        <Badge 
                          variant={title.status === 'published' ? 'default' : 'secondary'}
                          className="ml-auto"
                        >
                          {title.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="capitalize">{title.type}</span>
                        {title.year && <span>{title.year}</span>}
                        {title.duration_minutes && (
                          <span>{formatDuration(title.duration_minutes)}</span>
                        )}
                        <span>{title.views_count.toLocaleString()} views</span>
                        {title.internal_rating && (
                          <span>★ {title.internal_rating.toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link href={`/title/${title.slug}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      
                      <Link href={`/admin/content/${title.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{title.title}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the content and all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(title.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'No content matches your filters'
                  : 'No content uploaded yet'
                }
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}