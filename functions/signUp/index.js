const { sendResponse } = require("../../responses");
const { nanoid } = require('nanoid');
const bcrypt = require('bcryptjs');
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();


async function createAccount(username, hashedPassword, userId, firstname, lastname) {


    try {
        await db.put({
            TableName: 'accounts',
            Item: {
                username: username,
                password: hashedPassword,
                firstname: firstname,
                lastname: lastname,
                userId: userId
            }
        }).promise();

        return { success: true, userId: userId };
    } catch (error) {
        console.log(error);
        return { success: false, message: 'Could not create account' }
    }
}
async function checkIfUsernameExists(username) {
    const params = {
        TableName: 'accounts',
        Key: {
            username: username
        }
    };

    try {
        const result = await db.get(params).promise();

        if (result.Item) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
}
async function signup(username, password, firstname, lastname) {
    // check if username already exists
    // if username exists => return { success: false, message: 'username already exists}

    if (!username || !password || !firstname || !lastname) {
        return { success: false, message: 'All fields are required' };
    }
    
    const usernameExists = await checkIfUsernameExists(username);
    if (usernameExists) {
        return { success: false, message: 'Username already exists' };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = nanoid();

    const result = await createAccount(username, hashedPassword, userId, firstname, lastname);
    return result
}


exports.handler = async (event) => {

    const { username, password, firstname, lastname } = JSON.parse(event.body);

    //signup
    const result = await signup(username, password, firstname, lastname);

    if (result.success)
        return sendResponse(200, result);
    else
        return sendResponse(400, result);
}