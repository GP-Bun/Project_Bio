import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AdminList() {
  const [videos, setVideos] = useState<any[]>([]);

  const fetchVideos = async () => {
    const { data } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
    if (data) setVideos(data);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDelete = async (id: string, videoUrl: string, thumbUrl: string) => {
    if (confirm('Are you sure you want to delete this video?')) {
      try {
        // Delete from Storage
        if (videoUrl?.includes('videos/')) {
          const videoName = videoUrl.split('/').pop();
          if (videoName) await supabase.storage.from('videos').remove([videoName]);
        }
        if (thumbUrl && thumbUrl.includes('thumbnails/')) {
          const thumbName = thumbUrl.split('/').pop();
          if (thumbName) await supabase.storage.from('thumbnails').remove([thumbName]);
        }

        // Delete from DB
        await supabase.from('videos').delete().eq('id', id);
        fetchVideos();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1000px', margin: '40px auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your videos and content.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/" className="btn btn-outline" style={{ fontSize: '0.9rem' }}>View Live Site</Link>
          <Link to="/admin/add" className="btn" style={{ fontSize: '0.9rem' }}>+ New Video</Link>
        </div>
      </header>

      {/* Cột SIZE vẫn hiển thị trong bảng nhưng Thanh Đo tổng ở trên đã bị xóa */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
            <tr>
              <th style={{ padding: '1.2rem', color: 'var(--text-secondary)' }}>Video</th>
              <th style={{ padding: '1.2rem', color: 'var(--text-secondary)' }}>Views</th>
              <th style={{ padding: '1.2rem', color: 'var(--text-secondary)' }}>Size</th>
              <th style={{ padding: '1.2rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s ease' }} className="admin-tr">
                <td style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={video.thumbnailurl || video.thumbnailUrl} alt={video.title} style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div>
                    <h4 style={{ fontWeight: 500, marginBottom: '4px' }}>{video.title}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{video.duration || 'New'}</span>
                  </div>
                </td>
                <td style={{ padding: '1.2rem' }}>{video.views || 0}</td>
                <td style={{ padding: '1.2rem', fontSize: '0.85rem' }}>
                  {video.size ? `${(video.size / (1024 * 1024)).toFixed(1)} MB` : '-'}
                </td>
                <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <Link to={`/admin/edit/${video.id}`} className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>Edit</Link>
                    <button onClick={() => handleDelete(video.id, video.videourl, video.thumbnailurl)} className="btn" style={{ padding: '6px 14px', fontSize: '0.8rem', backgroundColor: '#3f3f46', marginLeft: '4px' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .admin-tr:hover {
          background-color: rgba(255, 255, 255, 0.02);
        }
      `}</style>
    </div>
  );
}
