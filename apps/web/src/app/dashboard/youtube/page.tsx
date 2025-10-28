'use client';

import { useState, useEffect } from 'react';
import { youtubeApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function YouTubeDashboard() {
  const router = useRouter();
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 토큰 확인
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      setLoading(true);
      const { data } = await youtubeApi.getChannels();
      setChannels(data.channels);
      
      if (data.channels.length > 0) {
        setSelectedChannel(data.channels[0].channelId);
      } else {
        // 채널이 없으면 동기화
        await syncChannels();
      }
    } catch (error: any) {
      console.error('❌ Failed to load channels:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      }
      setError('채널을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const syncChannels = async () => {
    try {
      setLoading(true);
      const { data } = await youtubeApi.syncChannels();
      setChannels(data.channels);
      
      if (data.channels.length > 0) {
        setSelectedChannel(data.channels[0].channelId);
      }
    } catch (error: any) {
      console.error('❌ Failed to sync channels:', error);
      setError('채널 동기화에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadVideos = async (channelId: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await youtubeApi.getVideos(channelId);
      setVideos(data.videos || []);
    } catch (error: any) {
      console.error('❌ Failed to load videos:', error);
      setError(error.response?.data?.message || '비디오를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChannel) {
      loadVideos(selectedChannel);
    }
  }, [selectedChannel]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">YouTube 대시보드</h1>
          <button
            onClick={syncChannels}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? '동기화 중...' : '채널 동기화'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Channel Select */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            채널 선택
          </label>
          <select
            value={selectedChannel || ''}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">채널을 선택하세요</option>
            {channels.map((channel: any) => (
              <option key={channel.channelId} value={channel.channelId}>
                {channel.title}
              </option>
            ))}
          </select>
        </div>

        {/* Videos */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">비디오 목록</h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">비디오가 없습니다.</p>
              <p className="text-sm text-gray-400 mt-2">채널을 선택하거나 동기화하세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video: any) => (
                <div
                  key={video.id?.videoId || video.videoId}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                >
                  <img
                    src={video.snippet?.thumbnails?.medium?.url || 'https://via.placeholder.com/320x180'}
                    alt={video.snippet?.title || 'Video'}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {video.snippet?.title || 'Untitled'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {new Date(video.snippet?.publishedAt).toLocaleDateString('ko-KR')}
                    </p>
                    {/* ✅ 여기 수정! */}
                    <button
                      onClick={() => {
                        const vId = video.id?.videoId || video.videoId;
                        const title = video.snippet?.title || 'Untitled';
                        router.push(`/dashboard/youtube/comments?videoId=${vId}&title=${encodeURIComponent(title)}`);
                      }}
                      className="w-full px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium transition"
                    >
                      💬 댓글 보기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}