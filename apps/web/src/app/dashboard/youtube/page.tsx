'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, Trash2, Reply, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { youtubeApi } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'

export default function YoutubePage() {
  const [channels, setChannels] = useState<any[]>([])
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [videos, setVideos] = useState<any[]>([])
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadChannels()
  }, [])

  const loadChannels = async () => {
    try {
      const { data } = await youtubeApi.getChannels()
      setChannels(data.channels)
      if (data.channels.length > 0) {
        setSelectedChannel(data.channels[0].channelId)
      }
    } catch (error) {
      console.error('Failed to load channels:', error)
    }
  }

  const loadVideos = async (channelId: string) => {
    try {
      setLoading(true)
      const { data } = await youtubeApi.getVideos(channelId)
      setVideos(data.videos)
    } catch (error) {
      console.error('Failed to load videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async (videoId: string) => {
    try {
      setLoading(true)
      const { data } = await youtubeApi.getComments(videoId)
      setComments(data.comments)
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const syncComments = async () => {
    if (!selectedVideo) return
    try {
      setLoading(true)
      const { data } = await youtubeApi.syncComments(selectedVideo)
      setComments(data.comments)
    } catch (error) {
      console.error('Failed to sync comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteComment = async (commentId: string) => {
    if (!confirm('정말 이 댓글을 삭제하시겠습니까?')) return
    
    try {
      await youtubeApi.deleteComment(commentId)
      setComments(comments.filter((c) => c.commentId !== commentId))
    } catch (error) {
      console.error('Failed to delete comment:', error)
      alert('댓글 삭제에 실패했습니다')
    }
  }

  useEffect(() => {
    if (selectedChannel) {
      loadVideos(selectedChannel)
    }
  }, [selectedChannel])

  useEffect(() => {
    if (selectedVideo) {
      loadComments(selectedVideo)
    }
  }, [selectedVideo])

  if (channels.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>YouTube 채널을 찾을 수 없습니다</CardTitle>
          <CardDescription>
            YouTube 계정을 먼저 연결해주세요
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">YouTube 댓글</h1>
          <p className="text-muted-foreground">
            {channels.length}개 채널의 댓글을 관리하세요
          </p>
        </div>
        <Button onClick={() => youtubeApi.syncChannels()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          채널 동기화
        </Button>
      </div>

      {/* 채널 선택 */}
      <Card>
        <CardHeader>
          <CardTitle>채널 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {channels.map((channel) => (
              <Button
                key={channel.channelId}
                variant={selectedChannel === channel.channelId ? 'default' : 'outline'}
                onClick={() => setSelectedChannel(channel.channelId)}
              >
                {channel.title}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 비디오 선택 */}
      {selectedChannel && (
        <Card>
          <CardHeader>
            <CardTitle>최근 비디오</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && !videos.length ? (
              <p className="text-muted-foreground">로딩 중...</p>
            ) : videos.length === 0 ? (
              <p className="text-muted-foreground">비디오가 없습니다</p>
            ) : (
              <div className="space-y-2">
                {videos.slice(0, 10).map((video) => (
                  <button
                    key={video.id?.videoId}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedVideo === video.id?.videoId
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => setSelectedVideo(video.id?.videoId)}
                  >
                    <p className="font-medium line-clamp-1">
                      {video.snippet?.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(video.snippet?.publishedAt).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 댓글 목록 */}
      {selectedVideo && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>댓글 목록</CardTitle>
                <CardDescription>{comments.length}개 댓글</CardDescription>
              </div>
              <Button onClick={syncComments} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                동기화
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>댓글이 없습니다</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>작성자</TableHead>
                    <TableHead>댓글</TableHead>
                    <TableHead>좋아요</TableHead>
                    <TableHead>작성일</TableHead>
                    <TableHead>액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comments.map((comment) => (
                    <TableRow key={comment.id}>
                      <TableCell className="font-medium">
                        {comment.authorName}
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="line-clamp-2">{comment.text}</p>
                      </TableCell>
                      <TableCell>{comment.likeCount}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatRelativeTime(comment.publishedAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteComment(comment.commentId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
