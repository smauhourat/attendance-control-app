import React, { useState } from 'react';
import {
    List,
    ListItem,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Box,
    InputAdornment,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const PersonList = ({ eventId, persons, onMarkAttendance }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const filteredPersons = persons.filter(person => {
        const searchLower = searchTerm.toLowerCase();
        return (
            person.name.toLowerCase().includes(searchLower) ||
            person.credentialNumber.toString().includes(searchLower) ||
            person.dni.toString().includes(searchLower) ||
            person.email.toLowerCase().includes(searchLower)
        );
    });

    const handlePersonSelect = (person) => {
        setSelectedPerson(person);
        setDialogOpen(true);
    };

    const handleConfirmAttendance = () => {
        onMarkAttendance(eventId, selectedPerson.id);
        setDialogOpen(false);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    return (
        <div>
            <Box className="search-container">
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Buscar por nombre, número de credencial, DNI o email..."
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

            {filteredPersons.length === 0 ? (
                <Typography variant="body1" align="center" style={{ marginTop: '20px' }}>
                    No se encontraron personas
                </Typography>
            ) : (
                <List>
                    {filteredPersons.map(person => (
                        <ListItem key={person.id} disableGutters>
                            <Card className="attendance-card" variant="outlined" sx={{ width: '100%' }}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <div>
                                            <Typography variant="h6" component="div">
                                                {person.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                DNI: {person.dni}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Credencial: {person.credentialNumber}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Email: {person.email}
                                            </Typography>
                                        </div>

                                        <Box>
                                            {person.hasAttended ? (
                                                <Box display="flex" alignItems="center" flexDirection="column">
                                                    <CheckCircleIcon color="success" style={{ fontSize: 40 }} />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(person.attendanceTime).toLocaleTimeString()}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => handlePersonSelect(person)}
                                                >
                                                    Marcar Asistencia
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </ListItem>
                    ))}
                </List>
            )}

            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
            >
                <DialogTitle>Confirmar Asistencia</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Desea registrar la asistencia de {selectedPerson?.name}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmAttendance} color="primary" variant="contained">
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default PersonList;