const { sendResponse } = require("../../responses");
const middy = require('@middy/core');
const { validateToken } = require("../middleware/auth");
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

const getAllNotes = async (event) => {


    const username = event.username;
    
    if (!username) {
        return sendResponse(401, { success: false, message: 'Unauthorized: Missing username' });
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
            ':isDeleted' : false
        }
    };

    try {
        const result = await db.query(params).promise();

        if (result.Items.length === 0) {
            return sendResponse(200, { success: true, message: 'No notes available' });
        }


        const notes = result.Items.map(note => ({
            username: note.username,
            id: note.id,
            title: note.title,
            text: note.text,
            createdAt: note.createdAt,
            modifiedAt: note.modifiedAt,
            isDeleted: note.isDeleted
        }));

        return sendResponse(200, { success: true, notes: notes });
    
    } catch (error) {
        console.log(error);
        return sendResponse(500, { success: false, message: 'Error fetching notes' })
    }

}

const handler = middy(getAllNotes)
    .use(validateToken);


module.exports = {handler};