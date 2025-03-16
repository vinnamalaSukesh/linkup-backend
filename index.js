import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import 'dotenv/config';
import mongoose from 'mongoose';
const {models,Schema,model} = mongoose

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
    .then(() => console.log('DB connected'))
    .catch((err) => console.log('DB connection error:', err));

const user = new Schema({
    clerkId: { type: String, required: true},
    uname: { type: String, required: true},

    friends: {
        count: { type: Number, default: 0 },
        list: [{
            id: { type: String, required: true },
            chatBox: { type: String, required: true }
        }],
        reqSent: [{ id: { type: String, required: true } }],
        reqReceived: [{ id: { type: String, required: true } }]
    },

    groups: {
        count: { type: Number, default: 0 },
        list: [{ id: { type: String, required: true } }]
    },

    posts: {
        count: { type: Number, required: true, default: 0 },
        list: [{
            postId: { type: String, required: true },
            postedOn: { type: Date, required: true },
            comments: {
                count: { type: Number, default: 0 },
                list: [{
                    commentedBy: { type: String, required: true },
                    comment: { type: String, required: true }
                }]
            },
            likes: {
                count: { type: Number, default: 0 },
                list: [{ likedBy: { type: String } }]
            }
        }]
    },

    profilePic: { type: String, default: "" },
    coverPic: { type: String, default: "" },
    caption: { type: String, default: "" },
    online: { type: Boolean, default: false },
})
const User = models["User"] || model("User", user);

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('app is working');
});

app.post('/clerkWebhook', async (req, res) => {
    try{
        const event = req.body
        if(event.type === "user.created"){
            await User({
                uname : event.data.username,
                clerkId : event.data.id
            }).save()
        }
        else if(event.type === "user deleted"){
            const existingUser = await User.findOne({ clerkId: event.data.id });
            if (existingUser) {
                const deletedUser = await User.findOneAndDelete({ clerkId: event.data.id });
                console.log(deletedUser, "User deleted successfully");
            } else {
                console.log("User not found, cannot delete.");
            }
        }
    }
    catch (err) {
        console.log(err)
        res.send('failed')
    }
});

server.listen(3001);
