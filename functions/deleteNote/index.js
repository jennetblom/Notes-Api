const { sendResponse } = require("../../responses");
const middy  = require('@middy/core');
const { validateToken } = require("../middleware/auth");
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

const deleteNote = async (event) => {

    const username = event.username;
    const id =  event.pathParameters.id;

    if (!id) {
        return sendResponse(400, { success: false, message: 'ID is required' });
    }
    const params = {
        TableName: 'notes-db',
        Key: {
            username, id
        },
        UpdateExpression: 'set #isDeleted = :isDeleted',
        ExpressionAttributeNames: {
            '#isDeleted' : 'isDeleted'
        },
        ExpressionAttributeValues: {
            ':isDeleted' : true
        },
        ReturnValues: 'ALL_NEW'
    };

    try {
        const result = await db.update(params).promise();

        return sendResponse(200, {success: true, message: 'Note deleted successfully', note: result.Attributes});
    } catch (error) {
        console.log(error);
        return sendResponse(500, { success: false, message: 'Could not delete note'})
    }

}

const handler = middy(deleteNote)
    .use(validateToken)


module.exports = { handler }; 