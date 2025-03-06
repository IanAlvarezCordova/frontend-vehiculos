// components/NotificationBell.tsx
import React from 'react';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';

interface NotificationBellProps {
  count: number;
  onClick: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ count, onClick }) => {
  return (
    <div className="notification-bell" style={{ position: 'relative', display: 'inline-block' }}>
      <Button icon="pi pi-bell" className="p-button-text" onClick={onClick} />
      {count > 0 && (
        <Badge value={count} severity="danger" style={{ position: 'absolute', top: '-5px', right: '-5px' }} />
      )}
    </div>
  );
};