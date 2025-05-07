import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import SyncIcon from '@mui/icons-material/Sync';

const Header = () => {
    const { isOnline, isSyncing, handleSync } = useContext(AppContext);
    const location = useLocation();
    const navigate = useNavigate();

    const isHomePage = location.pathname === '/';

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component={Link} to="/" style={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}>
                    Control de Asistencia
                </Typography>

                {!isHomePage && (
                    <Button color="inherit" onClick={() => navigate('/')}>
                        Volver
                    </Button>
                )}

                {isOnline && (
                    <Button
                        color="inherit"
                        startIcon={<SyncIcon />}
                        onClick={handleSync}
                        disabled={isSyncing}
                    >
                        {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                    </Button>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;