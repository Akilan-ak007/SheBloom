import { useState, useEffect } from 'react';
import { Sparkles, Heart, Activity, X } from 'lucide-react';

export default function ExplainDialog({ isOpen, onClose, task, context }) {
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setResponse('');
      
      const fetchExplanation = async () => {
        try {
          const taskName = task?.name || task?.task || 'this care task';
          const res = await fetch(`http://localhost:4000/api/timeline/explain?task=${encodeURIComponent(taskName)}&context=${encodeURIComponent(context || 'general')}`);
          const data = await res.json();
          setResponse(data.explanation || 'Explanation not available.');
        } catch (error) {
          console.error('AI Explain Error:', error);
          setResponse('Failed to connect to the SheBloom AI engine. Please ensure your backend is running.');
        } finally {
          setLoading(false);
        }
      };

      fetchExplanation();
    }
  }, [isOpen, task, context]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(27, 67, 50, 0.4)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={onClose}
      />
      <div 
        style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 2rem)',
          maxWidth: '500px',
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-xl)',
          zIndex: 1001,
          boxShadow: 'var(--shadow-lg), 0 20px 40px rgba(0,0,0,0.1)',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary-dark)' }}>
            <Sparkles size={18} fill="currentColor" />
            <h3 style={{ margin: 0, fontSize: 'var(--fs-body)' }}>AI Companion</h3>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer',
              padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{
          padding: 'var(--space-md) var(--space-lg)',
          background: 'var(--color-bg-subtle)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-lg)',
          borderLeft: '3px solid var(--color-primary-muted)'
        }}>
          <span style={{ fontSize: 'var(--fs-tiny)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>
            Why this matters:
          </span>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--fs-small)', fontWeight: 'var(--fw-semibold)' }}>
            {task?.name || 'Selected Care Task'}
          </p>
        </div>

        <div style={{ minHeight: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-primary-muted)' }}>
              <Activity size={20} style={{ animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: 'var(--fs-small)' }}>Consulting WHO guidelines & emotional context...</span>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(244, 132, 95, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-dark)' }}>
                <Heart size={16} fill="currentColor" />
              </div>
              <p style={{ margin: 0, fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-relaxed)', color: 'var(--color-text)' }}>
                {response}
              </p>
            </div>
          )}
        </div>

        <div style={{ marginTop: 'var(--space-lg)', borderTop: '1px solid rgba(183, 228, 199, 0.3)', paddingTop: 'var(--space-md)', fontSize: '10px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
          Guided by WHO/ICMR Maternal Guidelines • Under Dr. Sarah Jenkins' Approval
        </div>

        <style jsx>{`
          @keyframes slideUp {
            from { transform: translate(-50%, 20px); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes pulse {
            0% { opacity: 0.5; transform: scale(0.95); }
            50% { opacity: 1; transform: scale(1.05); }
            100% { opacity: 0.5; transform: scale(0.95); }
          }
        `}</style>
      </div>
    </>
  );
}
