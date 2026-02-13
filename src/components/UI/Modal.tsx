import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import type { ModalProps } from '../../types';

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }}>
            <div className="modal-content" style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                width: '100%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: 'var(--shadow-lg)',
                animation: 'slideUp 0.3s ease-out',
                margin: 'var(--spacing-md)'
            }}>
                <div className="modal-header" style={{
                    padding: 'var(--spacing-lg)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{title}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--spacing-sm)' }}>
                        <X size={24} color="var(--color-text-secondary)" />
                    </button>
                </div>
                <div className="modal-body" style={{ padding: 'var(--spacing-lg)' }}>
                    {children}
                </div>
            </div>
            <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 767px) {
          .modal-content {
            max-width: calc(100% - 2rem) !important;
            margin: 1rem !important;
            max-height: calc(100vh - 2rem) !important;
          }
          
          .modal-header {
            padding: var(--spacing-md) !important;
          }
          
          .modal-body {
            padding: var(--spacing-md) !important;
          }
        }
      `}</style>
        </div>
    );
};

export default Modal;
