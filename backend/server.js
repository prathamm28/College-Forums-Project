const express = require("express");
const {chats} = require("./data/data.js");

const app = express();

app.get('/',(req,res) => {
    res.send("API is Running");
} );

app.get('/api/chat', (req,res) => {
    res.send(chats);
});

app.get('/api/chat/:id', (req,res) => {
    console.send(req);
});

app.listen(5000,console.log("Server Standard on PORT 5000"));