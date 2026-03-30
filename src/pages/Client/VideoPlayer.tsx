import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function VideoPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState<any>(null);
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [viewMode, setViewMode] = useState<'mini' | 'cinema' | 'full'>('mini');
  const [controlsVisible, setControlsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  let timeout: any;

  const showControls = () => {
    setControlsVisible(true);
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (isPlaying) setControlsVisible(false);
    }, 3000);
  };

  const togglePlay = () => {
    const videoElement = document.getElementById('main-video') as HTMLVideoElement;
    if (!videoElement) return;
    if (videoElement.paused) {
      videoElement.play();
      setIsPlaying(true);
    } else {
      videoElement.pause();
      setIsPlaying(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    async function fetchVideos() {
      const { data: mainVideo } = await supabase.from('videos').select('*').eq('id', id).single();
      if (mainVideo) {
        setVideo(mainVideo);
        setLikes(mainVideo.likes || 0);
        
        const currentViews = parseInt(mainVideo.views || '0');
        await supabase.from('videos').update({ views: (currentViews + 1).toString() }).eq('id', id);

        const { data: others } = await supabase
          .from('videos')
          .select('*')
          .neq('id', id)
          .limit(10);
        setRelatedVideos(others || []);
      }
      setLoading(false);
    }
    if (id) fetchVideos();
  }, [id]);

  const handleLike = async () => {
    const newLikes = isLiked ? likes - 1 : likes + 1;
    setLikes(newLikes);
    setIsLiked(!isLiked);
    await supabase.from('videos').update({ likes: newLikes }).eq('id', id);
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>Loading...</div>;

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
          <span style={{ color: 'var(--accent)' }}>▶</span> BunWatch
        </div>
      </header>

      <main style={{
        backgroundColor: viewMode === 'cinema' ? '#050505' : 'transparent',
        minHeight: '100vh',
        transition: 'background-color 0.4s ease'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: (viewMode === 'mini' && window.innerWidth >= 1100) ? '1fr 380px' : '1fr',
          gap: '2rem',
          maxWidth: (viewMode === 'full' || viewMode === 'cinema') ? '100%' : '1400px',
          margin: '0 auto',
          padding: (viewMode === 'full' || viewMode === 'cinema') ? '0' : (window.innerWidth < 768 ? '0' : '0 2rem'),
        }}>
          
          <div style={{ flex: 1 }}>
            <div
              onMouseMove={showControls}
              onMouseLeave={() => isPlaying && setControlsVisible(false)}
              style={{
                width: '100%',
                maxWidth: viewMode === 'mini' ? '1200px' : '100%',
                margin: viewMode === 'mini' ? (window.innerWidth < 768 ? '0' : '1.5rem 0') : '0',
                aspectRatio: viewMode === 'full' ? 'auto' : '16/9',
                position: viewMode === 'full' ? 'fixed' : 'relative',
                top: 0, left: 0,
                zIndex: viewMode === 'full' ? 1000 : 1,
                transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                borderRadius: (viewMode === 'mini' && window.innerWidth >= 768) ? '12px' : '0',
                overflow: 'hidden',
                backgroundColor: '#000',
                height: viewMode === 'full' ? '100vh' : 'auto',
                boxShadow: (viewMode === 'mini' && window.innerWidth >= 768) ? '0 30px 60px rgba(0,0,0,0.6)' : 'none',
              }}
            >
              <video
                id="main-video"
                src={video.videourl || video.videoUrl}
                poster={video.thumbnailurl || video.thumbnailUrl}
                autoPlay
                onClick={togglePlay}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                style={{
                  width: '100%',
                  height: '100%',
                  outline: 'none',
                  backgroundColor: '#000',
                  objectFit: 'contain',
                  cursor: 'pointer'
                }}
              />

              <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                height: '100px',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                pointerEvents: 'none',
                opacity: controlsVisible ? 1 : 0,
                transition: 'opacity 0.4s ease'
              }} />

              <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                padding: '0 20px 15px 20px',
                opacity: controlsVisible ? 1 : 0,
                transform: `translateY(${controlsVisible ? '0' : '10px'})`,
                transition: 'all 0.4s ease',
                zIndex: 20
              }}>
                <div style={{ width: '100%', height: '3px', backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: '15px', position: 'relative', cursor: 'pointer' }}>
                  <div style={{ width: `${(currentTime/duration)*100}%`, height: '100%', backgroundColor: '#f00' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={togglePlay} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>{isPlaying ? '⏸' : '▶'}</button>
                    <span style={{ color: '#fff', fontSize: '0.8rem' }}>{formatTime(currentTime)} / {formatTime(duration)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => setViewMode(viewMode === 'cinema' ? 'mini' : 'cinema')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: window.innerWidth < 640 ? 'none' : 'block' }}>🔲</button>
                    <button onClick={() => setViewMode(viewMode === 'full' ? 'mini' : 'full')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>{viewMode === 'full' ? '🔳' : '⬜'}</button>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: window.innerWidth < 768 ? '1rem' : '1rem 0' }}>
              <h1 style={{ fontSize: window.innerWidth < 768 ? '1.3rem' : '1.8rem', marginBottom: '0.5rem' }}>{video.title}</h1>
              <div style={{ 
                display: 'flex', 
                flexDirection: window.innerWidth < 640 ? 'column' : 'row',
                gap: '1rem', 
                color: 'var(--text-secondary)', 
                marginBottom: '1.5rem', 
                alignItems: window.innerWidth < 640 ? 'flex-start' : 'center', 
                justifyContent: 'space-between' 
              }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ fontWeight: 640, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{video.views} lượt xem</span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', width: window.innerWidth < 480 ? '100%' : 'auto' }}>
                  <button onClick={handleLike} className="btn" style={{ flex: 1, padding: '8px 16px', fontSize: '0.85rem', borderRadius: '30px', backgroundColor: isLiked ? 'var(--accent)' : 'rgba(255,255,255,0.1)' }}>
                    <span>{isLiked ? '❤️' : '🤍'}</span> {likes}
                  </button>
                  <button className="btn btn-outline" style={{ flex: 1, padding: '8px 16px', fontSize: '0.85rem', borderRadius: '30px' }}>Chia sẻ</button>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <p style={{ lineHeight: '1.5', color: '#ddd', fontSize: '0.95rem' }}>{video.description}</p>
              </div>
            </div>
          </div>

          {(viewMode === 'mini' || window.innerWidth < 1100) && (
            <div style={{ paddingBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.2rem', color: 'var(--text-primary)' }}>Video đề xuất</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {relatedVideos.map(rv => (
                  <Link 
                    key={rv.id} 
                    to={`/player/${rv.id}`} 
                    style={{ display: 'flex', gap: '10px', textDecoration: 'none' }}
                  >
                    <div style={{ width: '160px', minWidth: '160px', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#222' }}>
                      <img src={rv.thumbnailurl || rv.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <h4 style={{ fontSize: '0.9rem', color: '#fff', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.2' }}>
                        {rv.title}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{rv.views} lượt xem</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
