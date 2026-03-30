import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AdminAdd() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // States for storage usage
  const [totalUsedSize, setTotalUsedSize] = useState(0);
  const STORAGE_LIMIT = 50 * 1024 * 1024; // Hạn mức 50MB (Bytes) - Bạn có thể chỉnh lại thành 500MB nếu muốn

  useEffect(() => {
    async function fetchUsage() {
      const { data } = await supabase.from('videos').select('size');
      if (data) {
        const total = data.reduce((sum: number, v: any) => sum + (v.size || 0), 0);
        setTotalUsedSize(total);
      }
    }
    fetchUsage();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file) return alert('Please enter title and select a video.');
    
    if (totalUsedSize + file.size > STORAGE_LIMIT) {
      return alert('Dung lượng lưu trữ của bạn đã đầy! Hãy xóa bớt video cũ trước khi tải thêm.');
    }

    setUploading(true);
    setProgress(0);
    let videoUrlStr = '';
    let thumbnailUrlStr = 'https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&q=80&w=600';

    try {
      // 1. Upload Video
      const videoExt = file.name.split('.').pop();
      const videoPath = `${Date.now()}.${videoExt}`;
      const { error: videoError } = await supabase.storage.from('videos').upload(videoPath, file);
      if (videoError) throw videoError;
      setProgress(40);
      videoUrlStr = supabase.storage.from('videos').getPublicUrl(videoPath).data.publicUrl;

      // 2. Upload Thumbnail
      if (thumbnailFile) {
        const thumbExt = thumbnailFile.name.split('.').pop();
        const thumbPath = `${Date.now()}.${thumbExt}`;
        const { error: thumbError } = await supabase.storage.from('thumbnails').upload(thumbPath, thumbnailFile);
        if (thumbError) throw thumbError;
        thumbnailUrlStr = supabase.storage.from('thumbnails').getPublicUrl(thumbPath).data.publicUrl;
        setProgress(70);
      }

      // 3. Save to Database
      const { error: dbError } = await supabase.from('videos').insert([{
        title,
        description,
        thumbnailurl: thumbnailUrlStr,
        videourl: videoUrlStr,
        views: '0',
        duration: 'New',
        size: file.size
      }]);
      if (dbError) throw dbError;

      setProgress(100);
      setTimeout(() => {
        alert('Upload Successful!');
        navigate('/admin');
      }, 500);

    } catch (error: any) {
      console.error(error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const projectedSize = totalUsedSize + (file?.size || 0);
  const usagePercent = Math.min((projectedSize / STORAGE_LIMIT) * 100, 100);
  const isOverLimit = projectedSize > STORAGE_LIMIT;

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '40px auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Upload Video</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Check your storage before publishing content.</p>
        </div>
        <Link to="/admin" className="btn btn-outline" style={{ fontSize: '0.9rem' }}>Cancel</Link>
      </header>

      <form className="glass-panel" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Video Title</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Recording title..." 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Description</label>
          <textarea 
            className="form-input" 
            placeholder="What's this video about?" 
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* 🖼️ THUMBNAIL PICKER (Đã khôi phục) */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Thumbnail Image (Optional)</label>
          <div style={{ 
            border: '2px dashed var(--border)', 
            padding: '1.5rem', 
            textAlign: 'center', 
            borderRadius: 'var(--radius-lg)', 
            backgroundColor: 'rgba(255,255,255,0.02)'
          }}>
            <p style={{ marginBottom: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {thumbnailFile ? `Image selected: ${thumbnailFile.name}` : 'Select a custom thumbnail image (JPG, PNG)'}
            </p>
            <input 
              type="file" 
              accept="image/*"
              style={{ display: 'none' }}
              id="thumbnail-upload"
              onChange={(e) => {
                if(e.target.files?.length) setThumbnailFile(e.target.files[0]);
              }}
            />
            <label htmlFor="thumbnail-upload" className="btn btn-outline" style={{ padding: '6px 15px', fontSize: '0.85rem' }}>Browse Thumbnail</label>
          </div>
        </div>

        {/* 🎬 VIDEO PICKER */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Video File (Max 50MB)</label>
          <div style={{ 
            border: `2px dashed ${isOverLimit ? '#ef4444' : 'var(--border)'}`, 
            padding: '2rem', 
            textAlign: 'center', 
            borderRadius: 'var(--radius-lg)', 
            backgroundColor: isOverLimit ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.02)',
            transition: 'all 0.3s'
          }}>
            <p style={{ marginBottom: '1rem', color: isOverLimit ? '#ef4444' : 'var(--text-secondary)', fontWeight: isOverLimit ? 600 : 400 }}>
              {file ? `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)` : 'Click to choose video'}
            </p>
            <input 
              type="file" 
              accept="video/*"
              style={{ display: 'none' }}
              id="file-upload"
              onChange={(e) => {
                if(e.target.files?.length) setFile(e.target.files[0]);
              }}
            />
            <label htmlFor="file-upload" className="btn btn-outline" style={{ borderColor: isOverLimit ? '#ef4444' : '' }}>
              {file ? 'Change Video' : 'Browse Video File'}
            </label>
          </div>
        </div>

        {/* STORAGE PREVIEW */}
        <div style={{ 
          marginTop: '0.2rem', 
          backgroundColor: 'rgba(255,255,255,0.03)', 
          padding: '1rem', 
          borderRadius: '12px',
          border: `1px solid ${isOverLimit ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)'}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
            <span style={{ color: isOverLimit ? '#ef4444' : 'var(--text-secondary)' }}>
              {isOverLimit ? '⚠️ Storage Full' : 'Post-upload projection:'}
            </span>
            <span style={{ fontWeight: 600, color: isOverLimit ? '#ef4444' : '#fff' }}>
              {(projectedSize / (1024 * 1024)).toFixed(1)} / 50 MB
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem', color: 'var(--accent)' }}>
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--accent)', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={uploading || isOverLimit} 
          className="btn" 
          style={{ 
            padding: '0.8rem', 
            fontSize: '1.1rem', 
            opacity: (uploading || isOverLimit) ? 0.5 : 1,
            cursor: (uploading || isOverLimit) ? 'not-allowed' : 'pointer'
          }}
        >
          {uploading ? 'Uploading...' : isOverLimit ? 'Full' : 'Post Video'}
        </button>
      </form>
    </div>
  );
}
