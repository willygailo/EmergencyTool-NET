import React, { ReactNode } from 'react';

interface AlertProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info';
}

export const Alert: React.FC<AlertProps> = ({ children, variant = 'info' }) => {
  const colors = {
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
  };

  return (
    <div style={{ padding: '1rem', borderRadius: '4px', background: `${colors[variant]}20`, color: colors[variant], border: `1px solid ${colors[variant]}` }}>
      {children}
    </div>
  );
};

export default Alert;