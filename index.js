import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import 'dotenv/config';
import  User from './user'
import mongoose from 'mongoose';

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

mongoose.connect(process.env.MONGODB_URI)
.then('DB connected')
.catch((err) => console.log(error))

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('app is working');
});

app.post('/clerkWebhook', async (req, res) => {
    try{
        const event = req.body
        if(event.type === "user.created"){
            const newUser = await User({
                uname : event.username,
                clerkId : event.clerkId
            }).save()
            console.log(newUser)
        }
        else if(event.type === "user deleted"){
           await User.findOneAndDelete({uname})
        }
        else if(event.type === "user updated"){
            await User.findOneAndUpdate({uname})
        }
        res.send('success')
        }
    catch (error) {
        console.log(error)
        res.send('failed')
    }
});

server.listen(3001);
