"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Trash2, EyeOff, Eye, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { instagramApi } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";

export default function InstagramPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState<any | null>(null);
  const [media, setMedia] = useState<any[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setError(null);
      const { data } = await instagramApi.getPages();
      setPages(data.pages || []);
      if ((data.pages || []).length > 0) {
        setSelectedPage(data.pages[0]);
      } else {
        // If no pages found, try syncing once
        await syncPages();
      }
    } catch (error) {
      console.error("Failed to load pages:", error);
      setError('페이지를 불러올 수 없습니다. 권한 또는 연결을 확인해주세요.');
    }
  };

  const loadMedia = async (pageId: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await instagramApi.getMedia(pageId);
      setMedia(data.media || []);
      // Reset selected media/comments when page changes
      setSelectedMedia(null);
      setComments([]);
    } catch (error) {
      console.error("Failed to load media:", error);
      setError('미디어를 불러올 수 없습니다. 인스타그램 계정이 페이지에 연결되었는지 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (mediaId: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await instagramApi.getComments(mediaId);
      setComments(data.comments || []);
    } catch (error) {
      console.error("Failed to load comments:", error);
      setError('댓글을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const syncComments = async () => {
    if (!selectedMedia || !selectedPage) return;
    try {
      setLoading(true);
      await instagramApi.syncComments(selectedMedia.id, selectedPage.id);
      // let the background job run, then refresh from DB
      await new Promise((r) => setTimeout(r, 2000));
      await loadComments(selectedMedia.id);
    } catch (error) {
      console.error("Failed to sync comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const syncPages = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await instagramApi.syncPages();
      setPages(data.pages || []);
      if ((data.pages || []).length > 0) {
        setSelectedPage(data.pages[0]);
      }
    } catch (error) {
      console.error('Failed to sync pages:', error);
      setError('페이지 동기화에 실패했습니다. Meta 권한을 확인하세요.');
    } finally {
      setLoading(false);
    }
  }

  const hideComment = async (commentId: string) => {
    if (!selectedPage) return;
    try {
      await instagramApi.hideComment(commentId, selectedPage.id);
      setComments((prev) =>
        (prev || []).map((c: any) => (c.commentId === commentId ? { ...c, hidden: true } : c))
      );
    } catch (error) {
      console.error("Failed to hide comment:", error);
      alert("댓글 숨기기에 실패했습니다.");
    }
  };

  const unhideComment = async (commentId: string) => {
    if (!selectedPage) return;
    try {
      await instagramApi.unhideComment(commentId, selectedPage.id);
      setComments((prev) =>
        (prev || []).map((c: any) => (c.commentId === commentId ? { ...c, hidden: false } : c))
      );
    } catch (error) {
      console.error("Failed to unhide comment:", error);
      alert("댓글 숨김 해제에 실패했습니다.");
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!selectedPage) return;
    if (!confirm("정말로 이 댓글을 삭제하시겠습니까?")) return;
    try {
      await instagramApi.deleteComment(commentId, selectedPage.id);
      setComments((prev) => (prev || []).filter((c: any) => c.commentId !== commentId));
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert("댓글 삭제에 실패했습니다.");
    }
  };

  const subscribeWebhook = async () => {
    if (!selectedPage) return;
    try {
      await instagramApi.subscribeWebhook(selectedPage.id);
      alert("Webhook 구독이 완료되었습니다.");
    } catch (error) {
      console.error("Failed to subscribe webhook:", error);
      alert("Webhook 구독에 실패했습니다.");
    }
  };

  useEffect(() => {
    if (selectedPage) {
      loadMedia(selectedPage.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPage?.id]);

  useEffect(() => {
    if (selectedMedia) {
      loadComments(selectedMedia.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMedia?.id]);

  if ((pages?.length ?? 0) === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Instagram 페이지를 찾을 수 없습니다</CardTitle>
          <CardDescription>
            Meta 로그인을 완료하고 페이지 동기화를 진행해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={loadPages}>페이지 새로고침</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pages */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>연결된 페이지</CardTitle>
              <CardDescription>Meta 계정으로 접근 가능한 Facebook 페이지 목록입니다.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={syncPages} disabled={loading}>페이지 동기화</Button>
              <Button variant="outline" onClick={subscribeWebhook}>Webhook 구독</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 text-sm text-red-600">{error}</div>
          )}
          <div className="flex flex-wrap gap-2">
            {pages.map((page) => (
              <Button
                key={page.id}
                variant={selectedPage?.id === page.id ? "default" : "secondary"}
                onClick={() => setSelectedPage(page)}
              >
                {page.name}
                {page.username && (
                  <span className="ml-2 text-xs text-muted-foreground">@{page.username}</span>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Media */}
      {selectedPage && (
        <Card>
          <CardHeader>
            <CardTitle>최근 게시물</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && media.length === 0 ? (
              <p className="text-muted-foreground">로딩 중...</p>
            ) : media.length === 0 ? (
              <p className="text-muted-foreground">게시물이 없습니다</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {media.slice(0, 12).map((item) => (
                  <button
                    key={item.id}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedMedia?.id === item.id
                        ? "border-primary"
                        : "border-transparent hover:border-accent"
                    }`}
                    onClick={() => setSelectedMedia(item)}
                  >
                    {item.media_url && (
                      <img
                        src={item.media_url}
                        alt={item.caption || ""}
                        className="object-cover w-full h-full"
                      />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2">
                      <p className="text-xs line-clamp-2">{item.caption || "캡션 없음"}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comments */}
      {selectedMedia && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>댓글 목록</CardTitle>
                <CardDescription>{(comments?.length ?? 0)}개 댓글</CardDescription>
              </div>
              <Button onClick={syncComments} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                동기화
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {(comments?.length ?? 0) === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                <p>댓글이 없습니다</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>사용자</TableHead>
                    <TableHead>내용</TableHead>
                    <TableHead>좋아요</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>작성일</TableHead>
                    <TableHead>액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(comments || []).map((comment: any) => (
                    <TableRow key={comment.id}>
                      <TableCell className="font-medium">@{comment.username}</TableCell>
                      <TableCell className="max-w-md">
                        <p className="line-clamp-2">{comment.text}</p>
                      </TableCell>
                      <TableCell>{comment.likeCount}</TableCell>
                      <TableCell>
                        {comment.hidden ? (
                          <Badge variant="destructive">숨김</Badge>
                        ) : (
                          <Badge variant="secondary">공개</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatRelativeTime(comment.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {comment.hidden ? (
                            <Button size="sm" variant="ghost" onClick={() => unhideComment(comment.commentId)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => hideComment(comment.commentId)}>
                              <EyeOff className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => deleteComment(comment.commentId)}>
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
  );
}
