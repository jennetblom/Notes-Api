import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendResponse } from '../../responses/index.js';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const dbClient = new DynamoDBClient({ region: 'eu-north-1' });



async function getUser(username) {

    try {
        const params = {
            TableName: 'accounts',
            Key: {
                username: { S: username }
            }
        };

        const command = new GetItemCommand(params);

        const data = await dbClient.send(command);

        if (data.Item) {
            return unmarshall(data.Item);
        } else {
            return false;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function login(username, password) {

    const user = await getUser(username);

    if (!user) return { success: false, message: 'Incorrect username or password' };

    const correctPassword = await bcrypt.compare(password, user.password);

    if (!correctPassword) return { success: false, message: 'Incorrect username or password' };

    const token = jwt.sign({ id: user.userId, username: user.username }, "aabbcc", { expiresIn: "1d" });

    return { success: true, token: token };
}


export const handler = async (event) => {
    try {
        const { username, password } = JSON.parse(event.body);

        const result = await login(username, password);

        if (result.success)
            return sendResponse(200, result);

        else
            return sendResponse(400, result);
    } catch (error) {
        return sendResponse(500, { success: false, message: 'Internal server error' });
    }
}
  