const bcrypt = require('bcryptjs')
const amqp = require('amqplib/callback_api');
const dotenv = require('dotenv').config();
const { getMenu, addItem, editItem, deleteItem, createUser, getUserByEmail, getCategories, getCategoryById, addCategory, editCategory, deleteCategory } = require('./db')


function isValidPassword(password) {
    // for checking if password length is between 8 and 15
    if (password.length < 8) {
        return false;
    }
    // to check space
    if (password.indexOf(" ") !== -1) {
        return false;
    }
    // for digits from 0 to 9
    let count = 0;
    for (let i = 0; i <= 9; i++) {
        if (password.indexOf(i) !== -1) {
            count = 1;
        }
    }
    if (count === 0) {
        return false;
    }
    // for special characters
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return false;
    }
    // for capital letters
    count = 0;
    for (let i = 65; i <= 90; i++) {
        if (password.indexOf(String.fromCharCode(i)) !== -1) {
            count = 1;
        }
    }
    if (count === 0) {
        return false;
    }
    // for small letters
    count = 0;
    for (let i = 97; i <= 122; i++) {
        if (password.indexOf(String.fromCharCode(i)) !== -1) {
            count = 1;
        }
    }
    if (count === 0) {
        return false;
    }
    // if all conditions fail
    return true;
}


amqp.connect(process.env.RABBITMQ_URL, (error0, connection) => {
    if (error0) {
        console.log(error0)
        return
    }

    connection.createChannel((error1, channel) => {
        if (error1) {
            console.log(error1)
            return
        }

        const registerQueue = 'registerQueue';
        const loginQueue = 'loginQueue';
        const getItemsQueue = 'getItemsQueue';
        const addItemQueue = 'addItemQueue';
        const editItemQueue = 'editItemQueue';
        const deleteItemQueue = 'deleteItemQueue';
        const getCategoriesQueue = 'getCategoriesQueue'
        const addCategoryQueue = 'addCategoryQueue'
        const editCategoryQueue = 'editCategoryQueue'
        const deleteCategoryQueue = 'deleteCategoryQueue'
        channel.assertQueue(registerQueue, { durable: false });
        channel.assertQueue(loginQueue, { durable: false });
        channel.assertQueue(getItemsQueue, { durable: false });
        channel.assertQueue(addItemQueue, { durable: false });
        channel.assertQueue(editItemQueue, { durable: false });
        channel.assertQueue(deleteItemQueue, { durable: false });
        channel.assertQueue(getCategoriesQueue, { durable: false });
        channel.assertQueue(addCategoryQueue, { durable: false });
        channel.assertQueue(editCategoryQueue, { durable: false });
        channel.assertQueue(deleteCategoryQueue, { durable: false });

        channel.consume(registerQueue, async (msg) => {
            let message
            let status
            const user = JSON.parse(msg.content.toString())
            const { email, password } = user
            try {
                const passValid = isValidPassword(password)
                if (!passValid) {
                    status = "danger"
                    message = "Invalid Password- Password should be at least 8 characters, should contain at least a digit, a lowercase and an uppercase letter and a special character"
                } else if (email && password && passValid) {
                    const salt = await bcrypt.genSalt(10)
                    const passwordHash = await bcrypt.hash(password, salt)
                    await createUser(email, passwordHash)
                    status = "success"
                    message = 'User Created successfully'
                }
                else {
                    status = "danger"
                    message = "Inputs missing"
                }
            }
            catch (error) {
                if (error.code == '23505') {
                    status = "danger"
                    message = `A user with email ${email} already exists!`
                }
                else {
                    status = "danger"
                    message = error.message
                }
            }
            const data = { status, message }
            channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(data)), {
                correlationId: msg.properties.correlationId
            })
            channel.ack(msg);
        })

        channel.consume(loginQueue, async (msg) => {
            const user = JSON.parse(msg.content.toString())
            const { email, password } = user
            let message
            let status
            try {
                if (email && password) {
                    const user_from_db = await getUserByEmail(email)
                    if (user_from_db.length) {
                        const passwordCompare = await bcrypt.compare(password, user_from_db[0].password)
                        if (passwordCompare) {
                            status = "success"
                            message = 'Login successful!'
                        } else {
                            message = 'Invalid Credentials!'
                            status = "danger"
                        }
                    } else {
                        message = 'No such user exists!'
                        status = "danger"
                    }
                }
                else {
                    status = "danger"
                    message = 'Please enter the credentials!'
                }
            }
            catch (error) {
                status = "danger"
                message = error.message
            }
            const data = { status, message }
            channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(data)), {
                correlationId: msg.properties.correlationId
            })
            channel.ack(msg);
        })

        channel.consume(getItemsQueue, async (msg) => {
            const items = await getMenu()
            channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(items)), {
                correlationId: msg.properties.correlationId
            });
            channel.ack(msg);
        });

        channel.consume(addItemQueue, async (msg) => {
            let status
            let message
            const item = JSON.parse(msg.content.toString())
            const item_name = item.item_name
            const item_description = item.item_description
            const cost = item.cost
            const category_id = item.category_id
            let item_id
            if (item_name && item_description && cost && category_id) {
                try {
                    await addItem(item_name, item_description, cost, category_id)
                    const items = await getMenu()
                    item_id = items[items.length - 1].item_id
                    status = "success"
                    message = "Item added successfully"
                } catch (error) {
                    if (error.code == '23505') {
                        status = "danger"
                        message = `The item with the name ${item_name} already exists!`
                    } else if (error.code === '23503') {
                        status = "danger"
                        message = `Invalid category ID: ${category_id}`
                    }
                    else {
                        status = "danger"
                        message = error.message
                    }
                }
            } else {
                status = "danger"
                message = "Please enter item details to add!"
            }
            const data = { status, message, item_id }
            channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(data)), {
                correlationId: msg.properties.correlationId
            });
            channel.ack(msg);
        });

        channel.consume(editItemQueue, async (msg) => {
            const item = JSON.parse(msg.content.toString())
            const columns = Object.keys(item)
            let status
            let message
            try {
                if (item.category_id) {
                    const categories = await getCategoryById(item.category_id)
                    if (categories.count <= 0) {
                        throw new Error("No category with such id!")
                    }
                }
                const result = await editItem(item, columns, item.item_id)
                if (result.count > 0) {
                    status = "success"
                    message = "Item edited successfully"
                } else {
                    status = "danger"
                    message = "No item with such id!"
                }
            } catch (error) {
                status = 'danger'
                message = error.message
            }
            const data = { status, message }
            channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(data)), {
                correlationId: msg.properties.correlationId
            });
            channel.ack(msg);
        })

        channel.consume(deleteItemQueue, async (msg) => {
            let status
            let message
            try {
                const id = msg.content.toString()
                const result = await deleteItem(parseInt(id))
                if (result.count > 0) {
                    status = "success"
                    message = "Item deleted successfully"
                } else {
                    status = "danger"
                    message = "No item with such id!"
                }
            } catch (error) {
                status = 'danger'
                message = error.message
            }
            const data = { status, message }
            channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(data)), {
                correlationId: msg.properties.correlationId
            });
            channel.ack(msg);
        });

        channel.consume(getCategoriesQueue, async (msg) => {
            const categories = await getCategories()
            channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(categories)), {
                correlationId: msg.properties.correlationId
            });
            channel.ack(msg);
        });

        channel.consume(addCategoryQueue, async (msg) => {
            let status
            let message
            const category = JSON.parse(msg.content.toString())
            const category_name = category.category_name
            if (category_name) {
                try {
                    await addCategory(category_name)
                    status = "success"
                    message = "Category added successfully"
                } catch (error) {
                    if (error.code == '23505') {
                        status = "danger"
                        message = `The category with the name ${category_name} already exists!`
                    }
                    else {
                        status = "danger"
                        message = error.message
                    }
                }
            } else {
                status = "danger"
                message = "Please enter category details to add!"
            }
            const data = { status, message }
            channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(data)), {
                correlationId: msg.properties.correlationId
            });
            channel.ack(msg);
        });

        channel.consume(editCategoryQueue, async (msg) => {
            const category = JSON.parse(msg.content.toString())
            const columns = Object.keys(category)
            let status
            let message
            try {
                const result = await editCategory(category, columns, category.category_id)
                if (result.count > 0) {
                    status = "success"
                    message = "Category edited successfully"
                } else {
                    status = "danger"
                    message = "No category with such id!"
                }
            } catch (error) {
                status = 'danger'
                message = error.message
            }
            const data = { status, message }
            channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(data)), {
                correlationId: msg.properties.correlationId
            });
            channel.ack(msg);
        })

        channel.consume(deleteCategoryQueue, async (msg) => {
            let status
            let message
            try {
                const id = msg.content.toString()
                const result = await deleteCategory(parseInt(id))
                if (result.count > 0) {
                    status = "success"
                    message = "Category deleted successfully"
                } else {
                    status = "danger"
                    message = "No category with such id!"
                }
            } catch (error) {
                if (error.code === '23503') {
                    status = "danger"
                    message = "Category cannot be deleted as it is linked to menu items."
                } else {
                    status = 'danger'
                    message = error.message
                }
            }
            const data = { status, message }
            channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(data)), {
                correlationId: msg.properties.correlationId
            });
            channel.ack(msg);
        });
    })
});
