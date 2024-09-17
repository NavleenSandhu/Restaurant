const postgres = require('postgres')

const sql = postgres({
    database: process.env.DATABASE,
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    pass: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
})

async function getMenu() {
    return await sql`
        select *
        from menu
        order by item_id
    `
}


async function addItem(itemName, itemDesciption, cost, category_id) {
    await sql`
        insert into menu(item_name,item_description,cost,category_id) 
        values(${itemName},${itemDesciption}, ${cost},${category_id})
    `
}

async function editItem(item, cols, id) {
    return await sql`
        update menu set ${sql(item, cols)}
        where item_id = ${id}
    `
}

async function deleteItem(id) {
    return await sql`
        delete from menu
        where item_id = ${id}
    `
}

async function createUser(email, password) {
    await sql`
        insert into menu_user(email, password) 
        values(${email},${password})
    `
}

async function getUserByEmail(email) {
    return await sql`
        select *
        from menu_user
        where email=${email}
    `
}

async function getCategories() {
    return await sql`
        select * from categories;
    `
}

async function getCategoryById(id) {
    return await sql`
        select * from categories
        where category_id=${id}
    `
}

async function addCategory(category_name) {
    await sql`
        insert into categories(category_name)
        values(${category_name})
    `
}
async function editCategory(category, cols, id) {
    return await sql`
        update categories set ${sql(category, cols)}
        where category_id = ${id}
    `
}

async function deleteCategory(id) {
    return await sql`
        delete from categories
        where category_id = ${id}
    `
}
module.exports = { getMenu, addItem, editItem, deleteItem, createUser, getUserByEmail, getCategories, getCategoryById, addCategory, editCategory, deleteCategory }