import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const SyncStatusBar = () => {
    const { isOnline, isSyncing, lastSyncTime } = useContext(AppContext);

    const getStatusClass = () => {
        if (isSyncing) return 'syncing';
        return isOnline ? 'online' : 'offline';
    };

    const getStatusText = () => {
        if (isSyncing) return 'Sincronizando datos...';

        if (isOnline) {
            if (lastSyncTime) {
                return `En línea - Última sincronización: ${lastSyncTime.toLocaleTimeString()}`;
            }
            return 'En línea';
        }

        return 'Sin conexión - Los cambios se sincronizarán cuando vuelva a estar en línea';
    };

    return (
        <div className={`sync-status-bar ${getStatusClass()}`}>
            {getStatusText()}
        </div>
    );
};

export default SyncStatusBar;