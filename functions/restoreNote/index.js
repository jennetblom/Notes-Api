
import { sendResponse } from '../../responses/index.js';
import { validateToken } from "../middleware/auth.js";
import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb'; 
import middy from '@middy/core';

const dbClient = new DynamoDBClient({ region: 'eu-north-1' });

const restoreNote = async (event) => {

    const username = event.username;
    const id =  event.pathParameters.id;

    if (!id) {
        return sendResponse(400, { success: false, message: 'ID is required' });
    } 

    const getParams = {
        TableName: 'notes-db',
        Key: {
            username: { S: username }, 
            id: { S: id }           
        }
    };


    try {
        const getCommand = new GetItemCommand(getParams); 
        const result = await dbClient.send(getCommand); 

        console.log('Retrieved Note:', result.Item); 
        if(!result.Item) {
            return sendResponse(404, {success: false, message: 'Note not found'});
        }
        if(result.Item.isDeleted===false) {
            return sendResponse(200, {success: true, message: 'Note already restored'});
        }
        const updateParams = {
            TableName: 'notes-db',
            Key: {
                username: { S: username },
                id: { S: id }
            },
            UpdateExpression: 'SET #isDeleted = :isDeleted, #modifiedAt = :modifiedAt',
            ExpressionAttributeNames: {
                '#isDeleted': 'isDeleted',
                '#modifiedAt': 'modifiedAt'
            },
            ExpressionAttributeValues: {
                ':isDeleted': { BOOL: false },  
                ':modifiedAt': { S: new Date().toISOString() } 
            },
            ReturnValues: 'ALL_NEW' 
        };

        const updateCommand = new UpdateItemCommand(updateParams); 
        const updateResult = await dbClient.send(updateCommand); 

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


