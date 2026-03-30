import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AdminEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState('');
  const [currentVideoSize, setCurrentVideoSize] = useState(0);

  const [file, setFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const [totalUsedSize, setTotalUsedSize] = useState(0);
  const STORAGE_LIMIT = 50 * 1024 * 1024; // 50MB Limit

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      const { data: videoData } = await supabase.from('videos').select('*').eq('id', id).single();
      if (videoData) {
        setTitle(videoData.title);
        setDescription(videoData.description);
        setCurrentVideoUrl(videoData.videourl);
        setCurrentThumbnailUrl(videoData.thumbnailurl);
        setCurrentVideoSize(videoData.size || 0);
      } else {
        alert('Video not found!');
        navigate('/admin');
        return;
      }
      const { data: allVideos } = await supabase.from('videos').select('size');
      if (allVideos) {
        const total = allVideos.reduce((sum: number, v: any) => sum + (v.size || 0), 0);
        setTotalUsedSize(total);
      }
      setLoading(false);
    }
    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return alert('Please enter a title.');
    
    const potentialSize = totalUsedSize - currentVideoSize + (file?.size || currentVideoSize);
    if (potentialSize > STORAGE_LIMIT) {
      return alert('Dung lượng sau khi thay đổi sẽ vượt quá giới hạn!');
    }

    setUploading(true);
    setProgress(0);
    let finalVideoUrlStr = currentVideoUrl;
    let finalThumbnailUrlStr = currentThumbnailUrl;
    let finalSize = currentVideoSize;

    try {
      if (file) {
        const videoExt = file.name.split('.').pop();
        const videoPath = `${Date.now()}.${videoExt}`;
        const { error: videoError } = await supabase.storage.from('videos').upload(videoPath, file);
        if (videoError) throw videoError;
        finalVideoUrlStr = supabase.storage.from('videos').getPublicUrl(videoPath).data.publicUrl;
        finalSize = file.size;
        setProgress(50);
      }

      if (thumbnailFile) {
        const thumbExt = thumbnailFile.name.split('.').pop();
        const thumbPath = `${Date.now()}.${thumbExt}`;
        const { error: thumbError } = await supabase.storage.from('thumbnails').upload(thumbPath, thumbnailFile);
        if (thumbError) throw thumbError;
        finalThumbnailUrlStr = supabase.storage.from('thumbnails').getPublicUrl(thumbPath).data.publicUrl;
        setProgress(80);
      }

      const { error: dbError } = await supabase.from('videos').update({
        title,
        description,
        thumbnailurl: finalThumbnailUrlStr,
        videourl: finalVideoUrlStr,
        size: finalSize
      }).eq('id', id);

      if (dbError) throw dbError;

      setProgress(100);
      setTimeout(() => {
        alert('Update Successful!');
        navigate('/admin');
      }, 500);

    } catch (error: any) {
      console.error(error);
      alert('Update failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const projectedTotal = totalUsedSize - currentVideoSize + (file?.size || currentVideoSize);
  const usagePercent = Math.min((projectedTotal / STORAGE_LIMIT) * 100, 100);
  const isOverLimit = projectedTotal > STORAGE_LIMIT;

  if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</div>;

  return (
    <div className="container" style={{ maxWidth: '850px', margin: '40px auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Edit Video</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Modify details and manage storage impact.</p>
        </div>
        <Link to="/admin" className="btn btn-outline" style={{ fontSize: '0.9rem' }}>Cancel</Link>
      </header>

      <form className="glass-panel" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Video Title</label>
          <input type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Description</label>
          <textarea className="form-input" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        {/* THUMBNAIL PREVIEW */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Thumbnail Image</label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <img src={currentThumbnailUrl} alt="Current" style={{ width: '160px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} />
            <div style={{ flex: 1, border: '2px dashed var(--border)', padding: '1rem', textAlign: 'center', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.02)' }}>
              <p style={{ fontSize: '0.85rem', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                {thumbnailFile ? `Selected: ${thumbnailFile.name}` : 'Click to Replace Image'}
              </p>
              <input type="file" accept="image/*" id="thumb-up" style={{ display: 'none' }} onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} />
              <label htmlFor="thumb-up" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '5px 15px' }}>Replace Image</label>
            </div>
          </div>
        </div>

        {/* VIDEO PREVIEW (Clean & Auto-loop) */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Video Content</label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
            <div style={{ 
              width: window.innerWidth < 768 ? '100%' : '240px', 
              aspectRatio: '16/9', 
              background: '#000', 
              borderRadius: '8px', 
              overflow: 'hidden',
              pointerEvents: 'none' // No interaction
            }}>
              <video 
                src={currentVideoUrl} 
                autoPlay 
                muted 
                loop 
                playsInline 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
            <div style={{ flex: 1, border: `2px dashed ${isOverLimit ? '#ef4444' : 'var(--border)'}`, padding: '1.5rem', textAlign: 'center', borderRadius: 'var(--radius-lg)', background: isOverLimit ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.02)', width: '100%' }}>
              <p style={{ color: isOverLimit ? '#ef4444' : 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '10px', fontWeight: isOverLimit ? 600 : 400 }}>
                {file ? `New: ${file.name} (${(file.size/(1024*1024)).toFixed(1)}MB)` : `Replacing Old (${(currentVideoSize/(1024*1024)).toFixed(1)}MB)`}
              </p>
              <input type="file" accept="video/*" id="video-up" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <label htmlFor="video-up" className="btn btn-outline" style={{ borderColor: isOverLimit ? '#ef4444' : '' }}>Replace Video File</label>
            </div>
          </div>
        </div>

        {/* STORAGE PREVIEW */}
        <div style={{ 
          marginTop: '0.5rem', 
          backgroundColor: 'rgba(255,255,255,0.03)', 
          padding: '1.2rem', 
          borderRadius: '12px',
          border: `1px solid ${isOverLimit ? '#ef444455' : 'rgba(255,255,255,0.1)'}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
            <span style={{ color: isOverLimit ? '#ef4444' : 'var(--text-secondary)' }}>
              {isOverLimit ? '⚠️ Vượt dung lượng!' : 'Dự toán sau khi sửa video này:'}
            </span>
            <span style={{ fontWeight: 600 }}>{(projectedTotal / (1024*1024)).toFixed(1)} / 50 MB</span>
          </div>
          <div style={{ width: '100%', height: '10px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${usagePercent}%`, 
              height: '100%', 
              backgroundColor: isOverLimit ? '#ef4444' : (usagePercent > 80 ? '#eab308' : 'var(--accent)'), 
              transition: 'all 0.5s ease'
            }} />
          </div>
        </div>

        {uploading && (
          <div style={{ padding: '0 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.8rem', color: 'var(--accent)' }}>
              <span>Đang lưu thay đổi...</span>
              <span>{progress}%</span>
            </div>
            <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--accent)', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}

        <button type="submit" disabled={uploading || isOverLimit} className="btn" style={{ padding: '1.2rem', fontSize: '1.1rem', opacity: (uploading || isOverLimit) ? 0.5 : 1 }}>
          {uploading ? 'Processing Data...' : isOverLimit ? 'Overlimit' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
