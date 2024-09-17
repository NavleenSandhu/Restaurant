const PORT = 4000
const Websocket = require('ws')
const express = require('express');
const app = express()
const server = app.listen(PORT, () => { })
const wss = new Websocket.Server({ server })

let managementClients = [];
let customerClients = [];

wss.on('connection', (ws, req) => {
    let clientType = req.url.includes("management") ? "management" : "customer";
    if (clientType === "management") {
        managementClients.push(ws);
    } else {
        customerClients.push(ws);
    }

    ws.on('message', (data) => {
        const parsedMessage = JSON.parse(data.toString());
        if (clientType === "customer" && parsedMessage.type === "order") {
            managementClients.forEach(client => {
                if (client.readyState === 1) {
                    parsedMessage.type = 'new_order'
                    client.send(JSON.stringify(parsedMessage));
                }
            });
        }
    })

    ws.on('close', () => {
        if (clientType === "management") {
            managementClients = managementClients.filter(client => client !== ws);
        } else {
            customerClients = customerClients.filter(client => client !== ws);
        }
    });
})