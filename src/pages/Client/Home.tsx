import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVideos, type Video } from '../../data/videoStore';

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    setVideos(getVideos());
  }, []);
  return (
    <div className="container">
      <header className="navbar">
        <div className="nav-logo">
          <span style={{ color: 'var(--accent)' }}>▶</span> BmadHub
        </div>
        <div>
          <Link to="/admin/login" className="btn btn-outline" style={{ fontSize: '0.9rem' }}>
            Admin Login
          </Link>
        </div>
      </header>

      <main>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Discover Videos</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Explore carefully curated premium content.</p>

        <div className="video-grid">
          {videos.map((video) => (
            <Link to={`/video/${video.id}`} key={video.id} className="video-card">
              <div 
                className="thumbnail-wrapper" 
                style={{ 
                  position: 'relative', 
                  borderRadius: 'var(--radius-md)', 
                  overflow: 'hidden', 
                  aspectRatio: '16/9',
                  marginBottom: '1rem',
                  backgroundColor: 'var(--bg-secondary)'
                }}
              >
                <img 
                  src={video.thumbnailUrl} 
                  alt={video.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                />
                <div style={{ position: 'absolute', bottom: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.8)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                  {video.duration}
                </div>
              </div>
              
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{video.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {video.views} views • {video.description.substring(0, 40)}...
              </p>
            </Link>
          ))}
        </div>
      </main>

      <style>{`
        .video-card {
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-md);
          transition: transform 0.3s ease;
        }
        .video-card:hover {
          transform: translateY(-4px);
        }
        .video-card:hover img {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
