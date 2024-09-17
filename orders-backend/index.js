const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken')
const amqp = require('amqplib')
const cors = require('cors')
const dotenv = require('dotenv').config();
const { addOrder, getOrdersForADate, getOrdersForToday, updateOrderStatus, orderStatsByDate, orderStatsForAPeriod, orderStatsByYear, getYears } = require('./db')
const JWT_SECRET = process.env.JWT_SECRET
const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: [process.env.MANAGEMENT_APP, process.env.OPERATIONS_APP],
    credentials: true
}))

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log("App live: " + PORT)
})

function userLoggedIn(req) {
    if (req.cookies) {
        const token = req.cookies.token
        if (token) {
            try {
                return jwt.verify(token, JWT_SECRET) ? true : false
            } catch (error) {
                console.log(error)
                return false
            }
        }
    }
    return false
}

app.get('/getOrders', async (req, res) => {
    let response
    if (userLoggedIn(req)) {
        const date = req.query.date
        if (date) {
            response = await getOrdersForADate(new Date(date).toLocaleDateString())
        }
        else {
            response = await getOrdersForToday()
        }
    } else {
        response = { status: 'forbidden', message: 'Not logged In' }
    }
    res.json(response)
})

app.post('/addOrder', async (req, res) => {
    let response
    if (userLoggedIn(req)) {
        const order = req.body
        const insertedOrder = await addOrder(order)
        response = { status: 'success', message: 'Order added', insertedOrder }
    } else {
        response = { status: 'forbidden', message: 'Not logged In' }
    }
    res.json(response)
})

app.put('/updateOrderStatus/:id', async (req, res) => {
    let response
    try {
        if (userLoggedIn(req)) {
            const id = req.params.id
            await updateOrderStatus(id)
            response = { status: 'success', message: 'Order updated' }
        } else {
            response = { status: 'forbidden', message: 'Not logged In' }
        }
    } catch (error) {
        response = { status: 'error', message: error.message }
    }
    res.json(response)
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body
    let connection, channel;
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        const correlationId = Math.random().toString() + Math.random().toString() + Math.random().toString();
        const replyQueue = await channel.assertQueue('', { exclusive: true })

        const loginQueue = 'loginQueue';
        await channel.assertQueue(loginQueue, { durable: false });

        channel.sendToQueue(loginQueue, Buffer.from(JSON.stringify({ email, password })), {
            correlationId: correlationId,
            replyTo: replyQueue.queue
        })

        const response = await new Promise((resolve, reject) => {
            channel.consume(replyQueue.queue, (msg) => {
                if (msg.properties.correlationId === correlationId) {
                    resolve(JSON.parse(msg.content.toString()))
                }
            }, { noAck: true });
            setTimeout(() => {
                reject(new Error('Login response timeout'));
            }, 5000);
        })
        await connection.close();
        if (response && response.status == 'success') {
            const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' })
            res.cookie('token', token, { httpOnly: true })
        }
        res.json(response)
    } catch (error) {
        console.error('Error during login process:', error.message);
        res.status(500).json({ status: 'error', message: 'An error occurred during login' });
    }
})
app.get('/analytics/orders/last-week', async (req, res) => {
    const today = new Date();
    const endDate = today.toLocaleDateString();
    const startDate = new Date(today.setDate(today.getDate() - 7)).toLocaleDateString();
    const result = await orderStatsForAPeriod(startDate, endDate)
    res.json(result)
})
app.get('/analytics/orders/last-month', async (req, res) => {
    const today = new Date();
    const endDate = today.toLocaleDateString();
    const startDate = new Date(today.setDate(today.getMonth() - 1)).toLocaleDateString();
    const result = await orderStatsForAPeriod(startDate, endDate)
    res.json(result)
})
app.get('/analytics/orders/year/:year', async (req, res) => {
    const result = await orderStatsByYear(req.params.year)
    res.json(result)
})

app.get('/analytics/orders/:date', async (req, res) => {
    const result = await orderStatsByDate(new Date(req.params.date).toLocaleDateString())
    res.json(result)
})

app.get('/getYears', async (req, res) => {
    const result = await getYears()
    res.json(result)
})
