const { sendResponse } = require("../../responses");
const middy  = require('@middy/core');
const { validateToken } = require("../middleware/auth");
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

const getNoteById = async (event) => {

  
    const username = event.username;
    const id =  event.pathParameters.id;

    if (!id) {
        return sendResponse(400, { success: false, message: 'ID is required' });
    }
    if (!username) {
        return sendResponse(401, { success: false, message: 'Unauthorized: Missing username' });
    }
    const params = {
        TableName: 'notes-db',
        Key: {
            username: username,
            id: id
        }
    };

    try {
        const result = await db.get(params).promise();

        if(!result.Item) {
            return sendResponse(404, { success: false, message: "Could not find note" });
        } 

        const note = {
            username: result.Item.username,
            id: result.Item.id,
            title: result.Item.title,
            text: result.Item.text,
            createdAt: result.Item.createdAt,
            modifiedAt: result.Item.modifiedAt,
            isDeleted: result.Item.isDeleted
        }

        return sendResponse(200,{ success: true, note: note});
    } catch (error) {
        console.log(error);
        return sendResponse(500, { success: false, message: 'Error fetching note' })
    }

}

const handler = middy(getNoteById)
    .use(validateToken)


module.exports = { handler }; 