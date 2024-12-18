import { sendResponse } from '../../responses/index.js';
import middy from '@middy/core';
import { validateToken } from "../middleware/auth.js";
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';

const dbClient = new DynamoDBClient({ region: 'eu-north-1' });

const getNoteById = async (event) => {

  
    const username = event.username;
    const id =  event.pathParameters.id;

    if (!id) {
        return sendResponse(400, { success: false, message: 'ID is required' });
    }
    if (!username) {
        return sendResponse(401, { success: false, message: 'Unauthorized: Missing username' });
    }
    const params = {
        TableName: 'notes-db',
        Key: {
            username: { S: username },
            id: { S: id }
        }
    };

    try {
        const getCommand = new GetItemCommand(params);
        const result = await dbClient.send(getCommand);

        if(!result.Item) {
            return sendResponse(404, { success: false, message: "Could not find note" });
        } 

        const note = {
            username: result.Item.username,
            id: result.Item.id,
            title: result.Item.title,
            text: result.Item.text,
            createdAt: result.Item.createdAt,
            modifiedAt: result.Item.modifiedAt,
            isDeleted: result.Item.isDeleted
        }

        return sendResponse(200,{ success: true, note: note});
    } catch (error) {
        console.log(error);
        return sendResponse(500, { success: false, message: 'Error fetching note' })
    }

}

export const handler = middy(getNoteById)
    .use(validateToken)

