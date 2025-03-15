import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import 'dotenv/config';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] },
});

io.on('connection', (socket) => {
    console.log('A user connected', socket.id);
    socket.on('message', (data) => {
        console.log('Received message', data);
        io.emit('message', data);
    });
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('app is working');
});

app.post('/clerkWebhook', async (req, res) => {
    
});

server.listen(3001);
