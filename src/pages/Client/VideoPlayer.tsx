import { useParams, Link, useNavigate } from 'react-router-dom';
import { getVideos } from '../../data/videoStore';

export default function VideoPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videos = getVideos();
  const video = videos.find(v => v.id === id);

  if (!video) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h2>Video not found</h2>
        <button onClick={() => navigate('/')} className="btn" style={{ marginTop: '20px' }}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '0', maxWidth: '100%' }}>
      <header className="navbar" style={{ padding: '1.5rem 2rem', borderBottom: 'none' }}>
        <Link to="/" className="btn btn-outline" style={{ fontSize: '0.9rem' }}>
          ← Back
        </Link>
        <div className="nav-logo" style={{ fontSize: '1.2rem' }}>
          <span style={{ color: 'var(--accent)' }}>▶</span> BmadHub
        </div>
      </header>

      <main style={{ backgroundColor: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', aspectRatio: '16/9' }}>
          <video 
            src={video.videoUrl} 
            poster={video.thumbnailUrl}
            controls
            autoPlay
            style={{ width: '100%', height: '100%', outline: 'none', backgroundColor: '#000' }}
          />
        </div>

        <div style={{ width: '100%', maxWidth: '1200px', padding: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{video.title}</h1>
          <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>{video.views} views</span>
            <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem', borderRadius: '20px' }}>
              Subscribe
            </button>
            <button className="btn" style={{ padding: '4px 12px', fontSize: '0.8rem', borderRadius: '20px' }}>
               Like
            </button>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <p style={{ lineHeight: '1.6', color: '#ccc' }}>
              {video.description}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
