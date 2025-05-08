import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getEvents, getPersonsByEvent, markAttendance, syncData } from '../services/dataService';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [events, setEvents] = useState([]);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState(null);

    // Check online status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Load initial data
    useEffect(() => {
        const loadEvents = async () => {
            const eventsData = await getEvents();
            setEvents(eventsData);
        };

        loadEvents();
    }, []);

    // Sync data when coming online
    useEffect(() => {
        if (isOnline) {
            handleSync();
        }
    }, [isOnline]);

    // Sync periodically when online
    useEffect(() => {
        let interval;

        if (isOnline) {
            interval = setInterval(() => {
                handleSync();
            }, 1 * 60 * 1000); // Sync every 1 minutes
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isOnline]);

    const handleSync = useCallback(async () => {
        if (isOnline && !isSyncing) {
            try {
                setIsSyncing(true);
                const updatedEvents = await syncData();
                setEvents(updatedEvents);
                setLastSyncTime(new Date());
            } catch (error) {
                console.error('Error syncing data:', error);
            } finally {
                setIsSyncing(false);
            }
        }
    }, [isOnline, isSyncing]);

    const refreshEvents = useCallback(async () => {
        const eventsData = await getEvents();
        setEvents(eventsData);
    }, []);

    const recordAttendance = useCallback(async (eventId, personId) => {
        await markAttendance(eventId, personId);
        await refreshEvents();
    }, [refreshEvents]);

    return (
        <AppContext.Provider
            value={{
                events,
                isOnline,
                isSyncing,
                lastSyncTime,
                handleSync,
                refreshEvents,
                getPersonsByEvent,
                recordAttendance
            }}
        >
            {children}
        </AppContext.Provider>
    );
};