import { sendResponse } from '../../responses/index.js';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { validateToken } from "../middleware/auth.js";
import { transpileSchema } from '@middy/validator/transpile';
import errorMiddleware from '../../utils/errorMiddleware';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'; 
import { nanoid } from 'nanoid';
import validator from '@middy/validator';


const dbClient = new DynamoDBClient({ region: 'eu-north-1' });


const postNote = async (event) => {
    console.log("Event body before validation:", event.body);

    const { title, text } = event.body;

    const username = event.username;
    const timestamp = new Date().toISOString();
    const id = nanoid(8);

    const params = {
        TableName: 'notes-db',
        Item: {
            username: { S: username }, 
            id: { S: id },            
            title: { S: title },    
            text: { S: text },        
            createdAt: { S: timestamp }, 
            modifiedAt: { S: timestamp }, 
            isDeleted: { BOOL: false }  
        }
    };

    try {
        const command = new PutItemCommand(params);
        await dbClient.send(command); 
        return sendResponse(200, { success: true, message: 'Note created successfully' })
    } catch (error) {
        console.log(error);
        return sendResponse(500, { success: false, message: 'Could not create' });
    }
}

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
export const handler = middy(postNote)
    .use(validateToken)         
    .use(jsonBodyParser())        
    .use(validator({
        eventSchema: transpileSchema(schema),  errorHandler: false  
    }))
    .use(errorMiddleware());



