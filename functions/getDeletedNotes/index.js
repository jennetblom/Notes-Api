const { sendResponse } = require("../../responses");
const middy = require('@middy/core');
const { validateToken } = require("../middleware/auth");
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

const getDeletedNotes = async (event) => {


    const username = event.username;
    if (!username) {
        return sendResponse(401, { success: false, message: 'Unauthorized - Invalid token' });
    }
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

        if(result.Items && result.Items.length > 0) {
            return sendResponse(200,{ success: true, notes: result.Items});
        } else {
            return sendResponse(200, {success: true, notes: [] });
        }
    } catch (error) {
        console.log(error);
        return sendResponse(500, { success: false, message: 'Error fetching notes' })
    }

}

const handler = middy(getDeletedNotes)
    .use(validateToken);


module.exports = {handler};