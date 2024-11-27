const { sendResponse } = require("../../responses");
const middy  = require('@middy/core');
const { validateToken } = require("../middleware/auth");
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

const getNoteById = async (event) => {

  
    const username = event.username;
    const id =  event.pathParameters.id;

    const params = {
        TableName: 'notes-db',
        KeyConditionExpression: 'username = :username and id = :id',
        ExpressionAttributeValues: {
            ':username' : username,
            ':id' : id
        },
    };

    try {
        const result = await db.query(params).promise();

        if(result.Items.length > 0) {
            return sendResponse(200,{ success: true, note: result.Items[0]});
        } else {
            return sendResponse(200, {success: true, message: "Couldnt find note"});
        }
    } catch (error) {
        console.log(error);
        return sendResponse(500, { success: false, message: 'Error fetching note' })
    }

}

const handler = middy(getNoteById)
    .use(validateToken)


module.exports = { handler }; 