import { sendResponse } from '../../responses/index.js';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { validateToken } from "../middleware/auth.js";
import { transpileSchema } from '@middy/validator/transpile';
import errorMiddleware from '../../utils/errorMiddleware';
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';  
import validator from '@middy/validator';

const dbClient = new DynamoDBClient({ region: 'eu-north-1' });

const schema = {
    type: "object",
    properties: {
        body: {
            type: "object",
            properties: {
                title: { type: "string", maxLength: 50 },
                text: { type: "string", maxLength: 300 }
            },
            required: ["title", "text"],
            additionalProperties: false
        }
    },
    required: ["body"]
};

const updateNote = async (event) => {

    const username = event.username;
    const id =  event.pathParameters.id;

    if (!id) {
        return sendResponse(400, { success: false, message: 'ID is required' });
    }

    const { title, text } = event.body;
    
    if (!title || !text) {
        return sendResponse(400, { success: false, message: "Title and text are required" });
    }

    const params = {
        TableName: 'notes-db',
        Key: { 
            username: { S: username },
            id: { S: id }
        },
        UpdateExpression: 'set #title = :title, #text = :text, #modifiedAt = :modifiedAt',
        ConditionExpression: 'attribute_exists(username) AND attribute_exists(id) AND #isDeleted = :isDeleted',
        ExpressionAttributeNames: {
            '#title': 'title',
            '#text': 'text',
            '#modifiedAt': 'modifiedAt',
            '#isDeleted': 'isDeleted'
        },
        ExpressionAttributeValues: {
            ':title': { S: title.trim() },
            ':text': { S: text.trim() },
            ':modifiedAt': { S: new Date().toISOString() },
            ':isDeleted': { BOOL: false }
        },
        ReturnValues: 'ALL_NEW',
    };

    try {
        const command = new UpdateItemCommand(params);  
        const result = await dbClient.send(command);  

        if (!result.Attributes) {
            return sendResponse(404, { success: false, message: 'Note not found or has been deleted' });
        }
        const note = {
            username: result.Attributes.username,
            id: result.Attributes.id,
            title: result.Attributes.title,
            text: result.Attributes.text,
            createdAt: result.Attributes.createdAt,
            modifiedAt: result.Attributes.modifiedAt,
            isDeleted: result.Attributes.isDeleted
        }
        return sendResponse(200, {success: true, message: 'Note updated successfully', note: note} );
    } catch (error) {
        console.log(error);
        if (error.code === 'ConditionalCheckFailedException') {
            return sendResponse(404, { success: false, message: 'Note not found or has been deleted' });
        }
        return sendResponse(500, { success: false, error: 'Could not update item'  })
    }

}

export const handler = middy(updateNote)
    .use(validateToken)
    .use(jsonBodyParser())        
    .use(validator({
        eventSchema: transpileSchema(schema),  errorHandler: false  
    }))
    .use(errorMiddleware());

