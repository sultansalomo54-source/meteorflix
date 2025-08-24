'use client'

import { AdminLayout } from '@/components/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTitles } from '@/hooks/use-titles'
import { 
  FileVideo, 
  Upload, 
  Eye, 
  Clock, 
  BarChart3,
  TrendingUp,
  Users,
  HardDrive
} from 'lucide-react'
import Link from 'next/link'
import { formatFileSize } from '@/lib/utils'

export default function AdminDashboard() {
  const { titles, loading } = useTitles({})

  const stats = {
    totalTitles: titles.length,
    publishedTitles: titles.filter(t => t.status === 'published').length,
    draftTitles: titles.filter(t => t.status === 'draft').length,
    processingTitles: titles.filter(t => t.status === 'processing').length,
    totalViews: titles.reduce((sum, t) => sum + t.views_count, 0),
    featuredTitles: titles.filter(t => t.featured).length,
  }

  const recentTitles = titles
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  const quickStats = [
    {
      title: 'Total Content',
      value: stats.totalTitles,
      icon: FileVideo,
      description: `${stats.publishedTitles} published`,
      color: 'text-blue-600'
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      description: 'All time views',
      color: 'text-green-600'
    },
    {
      title: 'Processing',
      value: stats.processingTitles,
      icon: Clock,
      description: 'Currently processing',
      color: 'text-orange-600'
    },
    {
      title: 'Featured',
      value: stats.featuredTitles,
      icon: TrendingUp,
      description: 'Featured content',
      color: 'text-purple-600'
    }
  ]

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to StreamVault Admin Panel
            </p>
          </div>
          
          <div className="flex gap-4">
            <Link href="/admin/upload">
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Content
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Content Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Content Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Published</span>
                <div className="flex items-center gap-2">
                  <Badge variant="default">{stats.publishedTitles}</Badge>
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ 
                        width: `${stats.totalTitles ? (stats.publishedTitles / stats.totalTitles) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Draft</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{stats.draftTitles}</Badge>
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div 
                      className="bg-gray-600 h-2 rounded-full"
                      style={{ 
                        width: `${stats.totalTitles ? (stats.draftTitles / stats.totalTitles) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Processing</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{stats.processingTitles}</Badge>
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full"
                      style={{ 
                        width: `${stats.totalTitles ? (stats.processingTitles / stats.totalTitles) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-12 h-8 bg-muted rounded animate-pulse" />
                      <div className="flex-1 space-y-1">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentTitles.length > 0 ? (
                <div className="space-y-3">
                  {recentTitles.map((title) => (
                    <div key={title.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-8 bg-muted rounded flex items-center justify-center">
                          <FileVideo className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{title.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge 
                              variant={title.status === 'published' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {title.status}
                            </Badge>
                            <span>{title.type}</span>
                            <span>•</span>
                            <span>{new Date(title.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Link href={`/admin/content/${title.id}`}>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No content yet. Upload some content to get started.
                </p>
              )}
              
              {recentTitles.length > 0 && (
                <div className="mt-4 text-center">
                  <Link href="/admin/content">
                    <Button variant="outline" size="sm">
                      View All Content
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/upload">
                <Button className="w-full justify-start" variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload New Content
                </Button>
              </Link>
              
              <Link href="/admin/content">
                <Button className="w-full justify-start" variant="outline">
                  <FileVideo className="mr-2 h-4 w-4" />
                  Manage Content
                </Button>
              </Link>
              
              <Link href="/browse">
                <Button className="w-full justify-start" variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview Site
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">~2.3 GB</div>
              <p className="text-xs text-muted-foreground">
                Estimated storage used
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Processing Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.processingTitles}</div>
              <p className="text-xs text-muted-foreground">
                Items in queue
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">
                Admin users
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}