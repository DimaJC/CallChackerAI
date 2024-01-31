import express from "express";
import http from 'http';

import checkerRouter from "./CheckerController/CheckerRouter.js";

const PORT = process.env.PORT || 3030;
const app = express();

app.use(express.json());
app.use('/', checkerRouter);

const server = http.createServer(app);

const start = async () => {
    try {
        server.listen(PORT)
    } catch (e) {
        console.error('error', e);
    }
}

start()
