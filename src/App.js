// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import EventDetailPage from './pages/EventDetailPage';
import SyncStatusBar from './components/SyncStatusBar';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Header />
        <Container maxWidth="md" style={{ marginTop: '20px', marginBottom: '70px' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/event/:eventId" element={<EventDetailPage />} />
          </Routes>
        </Container>
        <SyncStatusBar />
      </Router>
    </ThemeProvider>
  );
}

export default App;