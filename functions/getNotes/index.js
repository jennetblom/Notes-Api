const { sendResponse } = require("../../responses");
const  { middy } = require('@middy/core');
const { validateToken } = require("../middleware/auth");
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

const getNotes = async (event) => {

    if (event?.error && event?.error === '401') {
        return sendResponse(400, { success: false, message: 'Invalid token' });
    }

    const username = event.username;
    
    const params = {
        TableName: 'notes-db',
        KeyConditionExpression: 'username = :username',
        ExpressionAttributeValues: {
            ':username' : username
        }
    };

    try {
        const result = await db.query(params).promise();

        if(result.Items.length > 0) {
            return sendResponse(200,{ success: true, notes: result.Items});
        } else {
            return sendResponse(200, {success: true, message: "No notes found for the user"});
        }
    } catch (error) {
        console.log(error);
        return sendResponse(500, { success: false, message: 'Error fetching notes' })
    }

}

const handler = middy(getNotes)
    .use(validateToken)


module.exports = { handler };   