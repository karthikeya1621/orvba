import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { orders } from './orders';
import { initializeApp } from 'firebase/app';

export const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
const port = 3000;
export var socket: Socket;
const server = http.createServer(app);
const io = new Server(server);

const firebaseConfig = {
    apiKey: "AIzaSyA0wCmufZ5LVVKtWBbTGlWHVLBUARJ6h_U",
    authDomain: "orvba-c0ddb.firebaseapp.com",
    projectId: "orvba-c0ddb",
    storageBucket: "orvba-c0ddb.appspot.com",
    messagingSenderId: "494450039956",
    appId: "1:494450039956:web:ff2f33e4a876ae6a3b2881",
    measurementId: "G-JW4NLR6KDN"
};
const firebaseApp = initializeApp(firebaseConfig);

app.get('/', (req, res) => {
    res.send("Hello World");
});

io.on('connection', (_socket) => {
    socket = _socket;
    console.log('Socket Connection Established!');
    socket.on('disconnect', (reason) => {
        console.log('Socket Disconnected', reason);
    })
});

orders();

server.listen(port, () => {
    console.log('Server started at :' + port);
});
