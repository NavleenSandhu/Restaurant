const { MongoClient, ObjectId } = require('mongodb');

const client = new MongoClient(process.env.MONGO_URL)
async function connect() {
    try {
        await client.connect()
    } catch (error) {
        console.log(error.message)
    }
}
connect()
const collection = client.db(process.env.MONGO_DB).collection(process.env.MONGO_COLLECTION)
async function getOrdersForToday() {
    const date = new Date()
    return await collection.find({ date: date.toLocaleDateString() }).toArray()
}

async function getOrdersForADate(date) {
    return await collection.find({ date: date }).toArray()
}

async function addOrder(order) {
    const result = await collection.insertOne(order)
    const insertedOrder = { ...order, _id: result.insertedId };
    return insertedOrder
}

async function updateOrderStatus(id) {
    if (!ObjectId.isValid(id)) {
        throw new Error('Cannot update status: Invalid ObjectId format');
    }
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: { orderStatus: "Complete" } })
}

async function orderStatsByDate(date) {
    const results = await collection.aggregate([
        { $match: { date: date } },
        {
            $unwind: "$items"
        },
        {
            $group: {
                _id: "$date",
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: { $sum: "$items.cost" } },
                avgRevenue: { $avg: { $sum: "$items.cost" } }
            }
        }
    ])
    return (await results.toArray())
}

async function orderStatsForAPeriod(startDate, endDate) {
    return await collection.aggregate([
        {
            $match: {
                date: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $unwind: "$items"
        },
        {
            $group: {
                _id: "$date",
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: "$items.cost" }
            }
        },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: "$totalOrders" },
                totalRevenue: { $sum: "$totalRevenue" },
                avgRevenue: { $avg: "$totalRevenue" },
                dailyStats: {
                    $push: {
                        date: "$_id",
                        totalOrders: "$totalOrders",
                        totalRevenue: "$totalRevenue"
                    }
                }
            }
        },
        {
            $sort: { "dailyStats.date": 1 }
        },
        {
            $project: {
                _id: 0,
                totalOrders: 1,
                totalRevenue: 1,
                avgRevenue: 1,
                dailyStats: 1
            }
        }
    ]).toArray();
}
async function orderStatsByYear(year) {
    return await collection.aggregate([
        {
            $match: {
                date: {
                    $gte: `${year}-01-01`,
                    $lt: `${year + 1}-01-01`
                }
            }
        },
        {
            $unwind: "$items"
        },
        {
            $group: {
                _id: { $month: { $dateFromString: { dateString: "$date" } } },
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: "$items.cost" }
            }
        },
        {
            $sort: { _id: 1 }
        },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: "$totalOrders" },
                totalRevenue: { $sum: "$totalRevenue" },
                avgRevenue: { $avg: "$totalRevenue" },
                monthlyStats: {
                    $push: {
                        month: "$_id",
                        totalOrders: "$totalOrders",
                        totalRevenue: "$totalRevenue"
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                totalOrders: 1,
                totalRevenue: 1,
                avgRevenue: 1,
                monthlyStats: 1
            }
        }
    ]).toArray();

}

async function getYears() {
    return (await collection.aggregate([
        {
            $group: {
                _id: { year: { $year: { $dateFromString: { dateString: "$date" } } } }
            }
        },
        {
            $sort: { "_id.year": 1 }
        },
        {
            $project: {
                _id: 0,
                year: "$_id.year"
            }
        }
    ]).toArray()).map(result => result.year)
}

module.exports = { getOrdersForToday, getOrdersForADate, addOrder, updateOrderStatus, orderStatsByDate, orderStatsForAPeriod, orderStatsByYear, getYears }