import { Link } from 'react-router-dom';
import { mockVideos } from '../../data/mockVideos';

export default function AdminList() {
  return (
    <div className="container" style={{ maxWidth: '1000px', margin: '40px auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your videos and content.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/" className="btn btn-outline" style={{ fontSize: '0.9rem' }}>View Live Site</Link>
          <Link to="/admin/add" className="btn" style={{ fontSize: '0.9rem' }}>+ Upload Video</Link>
        </div>
      </header>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
            <tr>
              <th style={{ padding: '1.2rem', color: 'var(--text-secondary)' }}>Video</th>
              <th style={{ padding: '1.2rem', color: 'var(--text-secondary)' }}>Views</th>
              <th style={{ padding: '1.2rem', color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '1.2rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockVideos.map((video) => (
              <tr key={video.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s ease' }} className="admin-tr">
                <td style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={video.thumbnailUrl} alt={video.title} style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div>
                    <h4 style={{ fontWeight: 500, marginBottom: '4px' }}>{video.title}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{video.duration}</span>
                  </div>
                </td>
                <td style={{ padding: '1.2rem' }}>{video.views}</td>
                <td style={{ padding: '1.2rem' }}>
                  <span style={{ padding: '4px 12px', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', borderRadius: '20px', fontSize: '0.8rem' }}>Public</span>
                </td>
                <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>Edit</button>
                    <button className="btn" style={{ padding: '6px 14px', fontSize: '0.8rem', backgroundColor: '#3f3f46', marginLeft: '8px' }}>Delete</button>
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
