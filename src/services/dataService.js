import { openDB } from 'idb';
import apiClient from '../api/client';

// Initialize IndexedDB
const initDB = async () => {
    return openDB('attendance-app-db', 1, {
        upgrade(db) {
            // Store for events
            if (!db.objectStoreNames.contains('events')) {
                db.createObjectStore('events', { keyPath: 'id' });
            }

            // Store for persons
            if (!db.objectStoreNames.contains('persons')) {
                db.createObjectStore('persons', { keyPath: 'id' });
            }

            // Store for attendance records
            if (!db.objectStoreNames.contains('attendance')) {
                const attendanceStore = db.createObjectStore('attendance', { keyPath: 'id', autoIncrement: true });
                attendanceStore.createIndex('eventPerson', ['eventId', 'personId'], { unique: true });
            }

            // Store for offline operations queue
            if (!db.objectStoreNames.contains('offlineQueue')) {
                db.createObjectStore('offlineQueue', { keyPath: 'id', autoIncrement: true });
            }
        }
    });
};

// Mock API functions (replace with actual API calls in production)
const fetchEventsFromAPI = async () => {

    const { data } = await apiClient.get('/events');
    
    return data;

    // In a real app, this would be an API call
    // For demo purposes, returning mock data
    // return [
    //     {
    //         id: 1,
    //         name: 'Conferencia Anual',
    //         description: 'Conferencia anual de tecnología',
    //         date: '2025-05-15',
    //         status: 'open'
    //     },
    //     {
    //         id: 2,
    //         name: 'Taller de Desarrollo',
    //         description: 'Taller práctico de desarrollo web',
    //         date: '2025-05-20',
    //         status: 'open'
    //     },
    //     {
    //         id: 3,
    //         name: 'Encuentro de Networking',
    //         description: 'Evento para expandir tu red de contactos',
    //         date: '2025-04-30',
    //         status: 'closed'
    //     }
    // ];
};

const fetchPersonsByEventFromAPI = async (eventId) => {

    const { data } = await apiClient.get(`/events/${eventId}/persons`);

    return data;

    // In a real app, this would be an API call
    // For demo purposes, returning mock data
    const personsMap = {
        '681ce5e5dd7617f1eaaf5455': [
            { id: 101, name: 'Juan Pérez', credentialNumber: 'A12345', dni: '26789456', email: 'juan@example.com' },
            { id: 102, name: 'María López', credentialNumber: 'A12346', dni: '30456789', email: 'maria@example.com' },
            { id: 103, name: 'Carlos Gómez', credentialNumber: 'A12347', dni: '28456123', email: 'carlos@example.com' },
            { id: 104, name: 'Laura Torres', credentialNumber: 'A12348', dni: '31789654', email: 'laura@example.com' },
        ],
        2: [
            { id: 201, name: 'Pedro Ruiz', credentialNumber: 'B12345', dni: '29456123', email: 'pedro@example.com' },
            { id: 202, name: 'Ana Silva', credentialNumber: 'B12346', dni: '30123456', email: 'ana@example.com' },
            { id: 203, name: 'Roberto Díaz', credentialNumber: 'B12347', dni: '25789456', email: 'roberto@example.com' },
        ],
        3: [
            { id: 301, name: 'Sofía Martínez', credentialNumber: 'C12345', dni: '32456789', email: 'sofia@example.com' },
            { id: 302, name: 'Diego Fernández', credentialNumber: 'C12346', dni: '27123456', email: 'diego@example.com' },
            { id: 303, name: 'Lucía González', credentialNumber: 'C12347', dni: '33789123', email: 'lucia@example.com' },
            { id: 304, name: 'Martín Castro', credentialNumber: 'C12348', dni: '26456789', email: 'martin@example.com' },
            { id: 305, name: 'Valentina Ramos', credentialNumber: 'C12349', dni: '31123456', email: 'valentina@example.com' },
        ]
    };

    return personsMap[eventId] || [];
};

const sendAttendanceToAPI = async (eventId, personId, timestamp) => {
    // In a real app, this would be an API call to send attendance data
    console.log(`Sending attendance for event ${eventId}, person ${personId} at ${timestamp}`);
    // Return true to simulate successful API call
    return true;
};

// Local data operations
export const getEvents = async () => {
    const db = await initDB();

    // Get events from local DB
    let events = await db.getAll('events');

    // If no events in local DB, fetch from API and store locally
    if (events.length === 0) {
        events = await fetchEventsFromAPI();

        // Store events in IndexedDB
        const tx = db.transaction('events', 'readwrite');
        for (const event of events) {
            tx.store.put(event);
        }
        await tx.done;
    }

    // Fetch attendance data to calculate counts
    const attendanceRecords = await db.getAll('attendance');

    // Enhance events with attendance counts
    for (const event of events) {
        const personsForEvent = await getPersonsByEvent(event.id);
        event.totalPeople = personsForEvent.length;

        // Count attendees for this event
        event.attendanceCount = attendanceRecords.filter(record =>
            record.eventId == event.id
        ).length;
    }

    return events;
};

export const getPersonsByEvent = async (eventId) => {
    const db = await initDB();

    // Check if we have persons for this event in local DB
    let persons = await db.getAll('persons');
    persons = persons.filter(p => p.eventId == eventId);

    // If no persons in local DB, fetch from API and store locally
    if (persons.length === 0) {
        persons = await fetchPersonsByEventFromAPI(eventId);
        console.log('persons =>', persons)
        // Add eventId to each person
        // persons = persons.map(person => ({
        //     ...person,
        //     eventId: eventId
        // }));

        // Store persons in IndexedDB
        const tx = db.transaction('persons', 'readwrite');
        for (const person of persons) {
            tx.store.put(person);
        }
        await tx.done;
    }

    // Get attendance records
    const attendanceRecords = await db.getAll('attendance');

    // Add attendance info to each person
    for (const person of persons) {
        const attendance = attendanceRecords.find(
            record => record.eventId == eventId && record.personId == person.id
        );

        person.hasAttended = !!attendance;
        if (attendance) {
            person.attendanceTime = attendance.timestamp;
        }
    }

    return persons;
};

export const markAttendance = async (eventId, personId) => {
    const db = await initDB();
    const timestamp = new Date().toISOString();

    // Create attendance record
    const attendanceRecord = {
        eventId: parseInt(eventId),
        personId: parseInt(personId),
        timestamp
    };

    // Save attendance record locally
    const tx = db.transaction('attendance', 'readwrite');

    try {
        // Check if attendance already exists
        const index = tx.store.index('eventPerson');
        const existingRecord = await index.get([parseInt(eventId), parseInt(personId)]);

        if (!existingRecord) {
            await tx.store.add(attendanceRecord);
        }
        await tx.done;

        // If online, sync immediately
        if (navigator.onLine) {
            try {
                await sendAttendanceToAPI(eventId, personId, timestamp);
            } catch (error) {
                // If API call fails, add to offline queue
                await addToOfflineQueue('attendance', attendanceRecord);
            }
        } else {
            // If offline, add to queue for later sync
            await addToOfflineQueue('attendance', attendanceRecord);
        }

        return true;
    } catch (error) {
        console.error('Error marking attendance:', error);
        return false;
    }
};

const addToOfflineQueue = async (operation, data) => {
    const db = await initDB();
    const queueItem = {
        operation,
        data,
        timestamp: new Date().toISOString()
    };

    const tx = db.transaction('offlineQueue', 'readwrite');
    await tx.store.add(queueItem);
    await tx.done;
};

export const syncData = async () => {
    const db = await initDB();

    // Process offline queue
    const offlineQueue = await db.getAll('offlineQueue');

    if (offlineQueue.length > 0) {
        for (const item of offlineQueue) {
            try {
                if (item.operation === 'attendance') {
                    await sendAttendanceToAPI(
                        item.data.eventId,
                        item.data.personId,
                        item.data.timestamp
                    );

                    // Remove from queue after successful sync
                    const tx = db.transaction('offlineQueue', 'readwrite');
                    await tx.store.delete(item.id);
                    await tx.done;
                }
            } catch (error) {
                console.error('Error syncing item:', error);
                // Leave in queue for next sync attempt
                break;
            }
        }
    }

    // Refresh events data
    const apiEvents = await fetchEventsFromAPI();

    // Update local events
    const tx = db.transaction('events', 'readwrite');
    for (const event of apiEvents) {
        tx.store.put(event);
    }
    await tx.done;

    // Return updated events
    return getEvents();
};