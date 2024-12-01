
import { sendResponse } from '../../responses/index.js';
import middy from '@middy/core';
import { validateToken } from "../middleware/auth.js";
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';


const dbClient = new DynamoDBClient({ region: 'eu-north-1' });


const getDeletedNotes = async (event) => {


    const username = event.username;
    
    const params = {
        TableName: 'notes-db',
        KeyConditionExpression: '#username = :username',
        FilterExpression: '#isDeleted = :isDeleted',
        ExpressionAttributeNames: {
            '#username' : 'username',
            '#isDeleted' : 'isDeleted'
        },
        ExpressionAttributeValues: {
            ':username' : { S: username }, 
            ':isDeleted' : { BOOL: true } 
        }
    };

    try {
        const queryCommand = new QueryCommand(params);
        const result = await dbClient.send(queryCommand);

        if (result.Items.length === 0) {
            return sendResponse(200, { success: true, message: 'No notes available' });
        }
        
        const notes = result.Items.map(note => ({
            username: note.username,
            id: note.id,
            title: note.title,
            text: note.text,
            createdAt: note.createdAt,
            modifiedAt: note.modifiedAt,
            isDeleted: note.isDeleted
        }));

        return sendResponse(200, { success: true, notes: notes });
        
    } catch (error) {
        console.log(error);
        return sendResponse(500, { success: false, message: 'Error fetching notes' })
    }

}

export const handler = middy(getDeletedNotes)
    .use(validateToken)
 


