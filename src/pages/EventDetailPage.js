import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Box, Button, Skeleton, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonList from '../components/PersonList';
import { AppContext } from '../context/AppContext';

const EventDetailPage = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { events, getPersonsByEvent, recordAttendance } = useContext(AppContext);
    const [event, setEvent] = useState(null);
    const [persons, setPersons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadEventData = async () => {
            setLoading(true);

            // Find the event
            const eventData = events.find(e => e.id === parseInt(eventId) || e.id === eventId);

            if (!eventData) {
                navigate('/');
                return;
            }

            setEvent(eventData);

            // Get persons for this event
            const personsData = await getPersonsByEvent(eventId);
            setPersons(personsData);

            setLoading(false);
        };

        loadEventData();
    }, [eventId, events, getPersonsByEvent, navigate]);

    const handleMarkAttendance = async (eventId, personId) => {
        await recordAttendance(eventId, personId);

        // Update the persons list
        const personsData = await getPersonsByEvent(eventId);
        setPersons(personsData);
    };

    if (loading) {
        return (
            <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Skeleton variant="text" width={250} height={40} />
                    <Skeleton variant="circular" width={80} height={40} />
                </Box>
                <Skeleton variant="rectangular" height={60} />
                <Box mt={3}>
                    {[1, 2, 3].map((item) => (
                        <Box key={item} mb={2}>
                            <Skeleton variant="rectangular" height={100} />
                        </Box>
                    ))}
                </Box>
            </Box>
        );
    }

    if (!event) {
        return null;
    }

    const attendeeCount = persons.filter(p => p.hasAttended).length;

    return (
        <div>
            <Box className="event-detail-header">
                <Typography variant="h5">
                    {event.name}
                </Typography>
                <Chip
                    label={event.status === 'open' ? 'Abierto' : 'Cerrado'}
                    color={event.status === 'open' ? 'success' : 'error'}
                />
            </Box>

            <Typography variant="body1" gutterBottom>
                {event.description}
            </Typography>

            <Typography variant="body2" color="text.secondary" gutterBottom>
                Fecha: {new Date(event.date).toLocaleDateString()}
            </Typography>

            <Box className="attendance-summary">
                <Typography variant="body2">
                    <strong>Total Personas:</strong> {persons.length}
                </Typography>
                <Typography variant="body2">
                    <strong>Asistentes:</strong> {attendeeCount}
                </Typography>
            </Box>

            <Typography variant="h6" gutterBottom>
                Registro de Asistencia
            </Typography>

            <PersonList
                eventId={eventId}
                persons={persons}
                onMarkAttendance={handleMarkAttendance}
            />
        </div>
    );
};

export default EventDetailPage;