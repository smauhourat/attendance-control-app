import React, { useState } from 'react';
import {
    List,
    ListItem,
    Card,
    CardContent,
    Typography,
    TextField,
    Box,
    InputAdornment,
    Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const EventList = ({ events }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEvents = events.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <Box className="search-container">
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Buscar eventos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {filteredEvents.length === 0 ? (
                <Typography variant="body1" align="center" style={{ marginTop: '20px' }}>
                    No se encontraron eventos
                </Typography>
            ) : (
                <List>
                    {filteredEvents.map(event => (
                        <ListItem
                            key={event.id}
                            disableGutters
                            component={Link}
                            to={`/event/${event.id}`}
                            style={{ textDecoration: 'none' }}
                        >
                            <Card className="event-card" variant="outlined" sx={{ width: '100%' }}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                        <Typography variant="h6" component="div">
                                            {event.name}
                                        </Typography>
                                        <Chip
                                            label={event.status === 'open' ? 'Abierto' : 'Cerrado'}
                                            color={event.status === 'open' ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {event.description}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {new Date(event.date).toLocaleDateString()}
                                    </Typography>

                                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                                        <Box display="flex" alignItems="center">
                                            <PeopleIcon fontSize="small" style={{ marginRight: '5px' }} />
                                            <Typography variant="body2">
                                                {event.totalPeople} personas
                                            </Typography>
                                        </Box>

                                        <Box display="flex" alignItems="center">
                                            <CheckCircleIcon fontSize="small" style={{ marginRight: '5px' }} />
                                            <Typography variant="body2">
                                                {event.attendanceCount} asistentes
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </ListItem>
                    ))}
                </List>
            )}
        </div>
    );
};

export default EventList;
