'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { youtubeApi } from '@/lib/api';

export default function CommentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoId = searchParams.get('videoId');
  const videoTitle = searchParams.get('title');

  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (videoId) {
      loadComments();
    }
  }, [videoId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await youtubeApi.getComments(videoId!);
      setComments(data.comments || []);
      console.log('✅ Comments loaded:', data.comments?.length || 0);
    } catch (error: any) {
      console.error('❌ Failed to load comments:', error);
      setError('댓글을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const syncComments = async () => {
    try {
      setSyncing(true);
      setError(null);
      console.log('🔄 Syncing comments for video:', videoId);
      
      await youtubeApi.syncComments(videoId!);
      
      // 동기화 후 잠시 대기 (백그라운드 작업)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 댓글 다시 로드
      await loadComments();
      
      alert('댓글 동기화가 완료되었습니다!');
    } catch (error: any) {
      console.error('❌ Failed to sync comments:', error);
      setError('댓글 동기화에 실패했습니다.');
    } finally {
      setSyncing(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?\n\nYouTube에서도 삭제됩니다!')) {
      return;
    }

    try {
      await youtubeApi.deleteComment(commentId);
      alert('댓글이 삭제되었습니다.');
      loadComments();
    } catch (error: any) {
      console.error('❌ Failed to delete comment:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  const replyToComment = async (commentId: string) => {
    const text = prompt('답글을 입력하세요:');
    if (!text || text.trim() === '') return;

    try {
      await youtubeApi.replyComment(commentId, text);
      alert('답글이 작성되었습니다.');
      loadComments();
    } catch (error: any) {
      console.error('❌ Failed to reply:', error);
      alert('답글 작성에 실패했습니다.');
    }
  };

  if (!videoId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">비디오 ID가 없습니다.</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium"
          >
            ← 뒤로 가기
          </button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">댓글 관리</h1>
              <p className="text-gray-600">{decodeURIComponent(videoTitle || '비디오')}</p>
            </div>
            
            <button
              onClick={syncComments}
              disabled={syncing || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {syncing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  동기화 중...
                </>
              ) : (
                '댓글 동기화'
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Comments */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500">댓글을 불러오는 중...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-gray-500 mb-2 text-lg">댓글이 없습니다.</p>
              <p className="text-gray-400 text-sm mb-6">
                YouTube에서 댓글을 동기화하거나,<br/>
                비디오에 댓글이 있는지 확인하세요.
              </p>
              <button
                onClick={syncComments}
                disabled={syncing}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {syncing ? '동기화 중...' : '댓글 동기화하기'}
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {comments.map((comment: any) => (
                <div key={comment.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-gray-900">
                          {comment.authorName}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.publishedAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {comment.text}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          👍 {comment.likeCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => replyToComment(comment.commentId)}
                      className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium"
                    >
                      💬 답글
                    </button>
                    <button
                      onClick={() => deleteComment(comment.commentId)}
                      className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium"
                    >
                      🗑️ 삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 통계 */}
        {comments.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">통계</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{comments.length}</p>
                <p className="text-sm text-gray-600 mt-1">전체 댓글</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {comments.reduce((sum, c) => sum + (c.likeCount || 0), 0)}
                </p>
                <p className="text-sm text-gray-600 mt-1">총 좋아요</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {comments.filter(c => c.parentId).length}
                </p>
                <p className="text-sm text-gray-600 mt-1">답글</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}