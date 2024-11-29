

import { sendResponse } from '../../responses/index.js';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { validateToken } from "../middleware/auth.js";
import { transpileSchema } from '@middy/validator/transpile';
import errorMiddleware from '../../utils/errorMiddleware';
import AWS from 'aws-sdk';
import { nanoid } from 'nanoid';
import validator from '@middy/validator';
import httpErrorHandler from '@middy/http-error-handler';
const db = new AWS.DynamoDB.DocumentClient();


const postNote = async (event) => {
    console.log("Event body before validation:", event.body);

    const { title, text } = event.body;

    const username = event.username;
    const timestamp = new Date().toISOString();
    const id = nanoid(8);

    const params = {
        TableName: 'notes-db',
        Item: {
            username: username,
            id: id,
            title: title,
            text: text,
            createdAt: timestamp,
            modifiedAt: timestamp,
            isDeleted: false
        }
    };

    try {
        await db.put(params).promise();
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
        eventSchema: transpileSchema(schema)
    }))
    .use(errorMiddleware());



