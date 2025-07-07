const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('send_message', (data) => {
        const text = data.message;
        const cpp = spawn('./huffman_compress');

        let compressed = '';
        cpp.stdout.on('data', (chunk) => compressed += chunk);

        cpp.stdin.write(text);
        cpp.stdin.end();

        cpp.on('close', () => {
            console.log(`Compressed: ${compressed}`);
            io.emit('receive_message', { original: text, compressed });
        });
    });
});

server.listen(3001, () => {
    console.log('Server listening on port 3001');
});
