
import { sendResponse } from '../../responses/index.js'
import { validateToken } from "../middleware/auth.js";
import AWS from 'aws-sdk';
import validator from '@middy/validator';
import middy from '@middy/core';


const db = new AWS.DynamoDB.DocumentClient();

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
            ':username' : username,
            ':isDeleted' : true
        }
    };

    try {
        const result = await db.query(params).promise();

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
    .use(validateToken);


