
import { sendResponse } from '../../responses/index.js'
import { validateToken } from "../middleware/auth.js";
import AWS from 'aws-sdk';
import validator from '@middy/validator';
import middy from '@middy/core';


const db = new AWS.DynamoDB.DocumentClient();
const restoreNote = async (event) => {

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

        console.log('Retrieved Note:', result.Item); 
        if(!result.Item) {
            return sendResponse(404, {success: false, message: 'Note not found'});
        }
        if(result.Item.isDeleted===false) {
            return sendResponse(200, {success: true, message: 'Note already restored'});
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
                ':isDeleted': false,
                ':modifiedAt': new Date().toISOString()
            },
            ReturnValues: 'ALL_NEW',
        };

        const updateResult = await db.update(updateParams).promise();
        console.log('Update Result:', updateResult);
        if (!updateResult.Attributes) {
            return sendResponse(500, { success: false, message: 'Error restoring note' });
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
        return sendResponse(200, {success: true, message: 'Note restored successfully', note: note});
       
    } catch (error) {
        console.log(error);
        return sendResponse(500, { success: false, message: 'Could not restore note'})
    }

}

export const handler = middy(restoreNote)
    .use(validateToken)


