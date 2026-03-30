import { mockVideos } from './mockVideos';

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  views: string;
  duration: string;
}

export const getVideos = (): Video[] => {
  const stored = localStorage.getItem('bmad_videos_v2');
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize with mock data if nowhere else
  localStorage.setItem('bmad_videos_v2', JSON.stringify(mockVideos));
  return mockVideos;
};

export const addVideo = (video: Video) => {
  const current = getVideos();
  const updated = [video, ...current];
  localStorage.setItem('bmad_videos_v2', JSON.stringify(updated));
};

export const deleteVideo = (id: string) => {
  const current = getVideos();
  const updated = current.filter(v => v.id !== id);
  localStorage.setItem('bmad_videos_v2', JSON.stringify(updated));
};
