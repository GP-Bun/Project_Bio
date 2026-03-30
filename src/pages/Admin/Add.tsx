import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addVideo } from '../../data/videoStore';

export default function AdminAdd() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file) return alert('Please enter title and select a video.');
    
    const videoUrl = URL.createObjectURL(file);
    addVideo({
      id: Date.now().toString(),
      title,
      description,
      thumbnailUrl: 'https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&q=80&w=600',
      videoUrl,
      views: '0',
      duration: 'New'
    });

    alert('Mock Upload Successful!');
    navigate('/admin');
  };

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '40px auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Upload Video</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Share a new video with your audience.</p>
        </div>
        <Link to="/admin" className="btn btn-outline" style={{ fontSize: '0.9rem' }}>Cancel</Link>
      </header>

      <form className="glass-panel" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Video Title</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="E.g., Cinematic Nature 4k" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Description</label>
          <textarea 
            className="form-input" 
            placeholder="Tell viewers about your video..." 
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Video File</label>
          <div style={{ 
            border: '2px dashed var(--border)', 
            padding: '3rem', 
            textAlign: 'center', 
            borderRadius: 'var(--radius-lg)', 
            backgroundColor: 'rgba(255,255,255,0.02)',
            cursor: 'pointer',
            transition: 'border-color 0.3s ease'
          }}>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              {file ? file.name : 'Drag & drop your .mp4 file here'}
            </p>
            <input 
              type="file" 
              accept="video/mp4,video/x-m4v,video/*"
              style={{ display: 'none' }}
              id="file-upload"
              onChange={(e) => {
                if(e.target.files?.length) setFile(e.target.files[0]);
              }}
            />
            <label htmlFor="file-upload" className="btn btn-outline" style={{ display: 'inline-flex' }}>Browse Files</label>
          </div>
        </div>

        <button type="submit" className="btn" style={{ padding: '1rem', marginTop: '1rem', fontSize: '1.1rem' }}>
          Start Upload
        </button>
      </form>
    </div>
  );
}
