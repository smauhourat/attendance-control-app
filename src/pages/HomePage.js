import React, { useContext, useState, useEffect } from 'react';
import { Typography, Box, Skeleton } from '@mui/material';
import EventList from '../components/EventList';
import { AppContext } from '../context/AppContext';

const HomePage = () => {
    const { events, refreshEvents } = useContext(AppContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadEvents = async () => {
            setLoading(true);
            await refreshEvents();
            setLoading(false);
        };

        loadEvents();
    }, [refreshEvents]);

    return (
        <div>
            <Typography variant="h4" className="app-title">
                Eventos Disponibles
            </Typography>

            {loading ? (
                <Box>
                    {[1, 2, 3].map((item) => (
                        <Box key={item} mb={2}>
                            <Skeleton variant="rectangular" height={150} />
                        </Box>
                    ))}
                </Box>
            ) : (
                <EventList events={events} />
            )}
        </div>
    );
};

export default HomePage;