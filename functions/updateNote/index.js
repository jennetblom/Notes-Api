const { sendResponse } = require("../../responses");
const middy = require('@middy/core');
const { validateToken } = require("../middleware/auth");
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

const updateNote = async (event) => {

    if (event?.error && event?.error === '401') {
        return sendResponse(401, { success: false, message: event.message || 'Invalid toooken' });
    }

    const username = event.username;
    const id =  event.pathParameters.id;

    const {title,  text} = JSON.parse(event.body);
    if (!title || !text) {
        return sendResponse(400, { success: false, message: "Title and text are required" });
    }

    const params = {
        TableName: 'notes-db',
        Key: {
            username,
            id
        },
        UpdateExpression: 'set #title = :title, #text = :text',
        ExpressionAttributeNames: {
            '#title': 'title', 
            '#text': 'text' 
        },
        ExpressionAttributeValues: {
            ':title': title, 
            ':text': text     
        },
        ReturnValues: 'ALL_NEW',
    };

    try {
        const result = await db.update(params).promise();

        return sendResponse(200, {success: true, message: 'Note updated successfully', note: result.Attributes} );
    } catch (error) {
        console.log(error);
        return sendResponse(500, { error: 'Could not update item'  })
    }

}

const handler = middy(updateNote)
    .use(validateToken);


module.exports = {handler};