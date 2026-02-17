import { Settings } from 'lucide-react';
import { useLayout } from '../../context/LayoutContext';
import { useEffect } from 'react';


const AdminSettings = () => {
    const { setTitle } = useLayout();

    useEffect(() => {
        setTitle('기본 설정');
    }, [setTitle]);

    return (
        <div style={{ padding: 'var(--spacing-lg)' }}>

            <div style={{
                backgroundColor: 'var(--color-surface)',
                padding: 'var(--spacing-xl)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                textAlign: 'center',
                color: 'var(--color-text-secondary)'
            }}>
                <p>사용 가능한 설정 항목이 없습니다.</p>
            </div>
        </div>
    );
};

export default AdminSettings;
