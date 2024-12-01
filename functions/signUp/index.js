import { sendResponse } from '../../responses/index.js';
import { DynamoDBClient, PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { nanoid } from 'nanoid';


const dbClient = new DynamoDBClient({ region: 'eu-north-1' });

const schema = {
    type: "object",
    properties: {
        body: {
            type: "object",
            properties: {
                username: { type: "string", minLength: 1 },
                password: { type: "string", minLength: 1 },
                firstname: { type: "string", minLength: 1 },
                lastname: { type: "string", minLength: 1 },
            },
            required: ["username", "password", "firstname", "lastname"],
            additionalProperties: false
        }
    },
    required: ["body"]
};

async function createAccount(username, hashedPassword, userId, firstname, lastname) {


    try {
        const params = {
            TableName: 'accounts',
            Item: {
                username: { S: username },
                password: { S: hashedPassword },
                firstname: { S: firstname },
                lastname: { S: lastname },
                userId: { S: userId }
            }
        };
        const command = new PutItemCommand(params);
        await dbClient.send(command);
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
            username: { S: username }
        }
    };

    try {
        const command = new GetItemCommand(params);
        const result = await dbClient.send(command);

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


export const handler = async (event) => {

    const { username, password, firstname, lastname } = JSON.parse(event.body);

    //signup
    const result = await signup(username, password, firstname, lastname);

    if (result.success)
        return sendResponse(200, result);
    else
        return sendResponse(400, result);
}