
import { sendResponse } from '../../responses/index.js'
import { validateToken } from "../middleware/auth.js";
import AWS from 'aws-sdk';
import validator from '@middy/validator';
import middy from '@middy/core';



const db = new AWS.DynamoDB.DocumentClient();

const deleteNote = async (event) => {

    const username = event.username;
    const id =  event.pathParameters.id;

    if (!id) {
        return sendResponse(400, { success: false, message: 'ID is required' });
    }

    const getParams = {
        TableName: 'notes-db',
        Key: { username, id }
    };
    

    try {
        const result = await db.get(getParams).promise();

        if (!result.Item) {
            return sendResponse(404, { success: false, message: 'Note not found' });
        }
        if (result.Item.isDeleted) {
            return sendResponse(200, { success: true, message: 'Note was already deleted' });
        }
        const updateParams = {
            TableName: 'notes-db',
            Key: { username, id },
            UpdateExpression: 'set #isDeleted = :isDeleted, #modifiedAt = :modifiedAt',
            ExpressionAttributeNames: {
                '#isDeleted': 'isDeleted',
                '#modifiedAt': 'modifiedAt'
            },
            ExpressionAttributeValues: {
                ':isDeleted': true,
                ':modifiedAt': new Date().toISOString()
            },
            ReturnValues: 'ALL_NEW',
        };

        const updateResult = await db.update(updateParams).promise();

        if (!updateResult.Attributes) {
            return sendResponse(500, { success: false, message: 'Error marking note as deleted' });
        }
        
        const note = {
            username: updateResult.Attributes.username,
            id: updateResult.Attributes.id,
            title: updateResult.Attributes.title,
            text: updateResult.Attributes.text,
            createdAt: updateResult.Attributes.createdAt,
            modifiedAt: updateResult.Attributes.modifiedAt,
            isDeleted: updateResult.Attributes.isDeleted
        };
        return sendResponse(200, {success: true, message: 'Note deleted successfully', note: note});
    } catch (error) {
        console.log(error);
        return sendResponse(500, { success: false, message: 'Could not delete note'})
    }

}

export const handler = middy(deleteNote)
    .use(validateToken)
