import React from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    variant?: 'danger' | 'warning' | 'info';
    confirmText?: string;
    cancelText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    variant = 'danger',
    confirmText = 'Confirm',
    cancelText = 'Cancel'
}) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const icons: Record<string, React.JSX.Element> = {
        danger: <AlertTriangle size={24} />,
        warning: <AlertTriangle size={24} />,
        info: <Info size={24} />
    };

    return (
        <div className="confirm-dialog-overlay" onClick={onClose}>
            <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                <button className="confirm-dialog-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className={`confirm-dialog-icon confirm-dialog-icon-${variant}`}>
                    {icons[variant] || icons.danger}
                </div>

                <h3 className="confirm-dialog-title">{title}</h3>
                <p className="confirm-dialog-message">{message}</p>

                <div className="confirm-dialog-actions">
                    <button className="btn btn-outline" onClick={onClose}>
                        {cancelText}
                    </button>
                    <button
                        className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                        onClick={handleConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
