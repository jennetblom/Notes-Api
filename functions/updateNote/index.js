const { sendResponse } = require("../../responses");
const middy = require('@middy/core');
const { validateToken } = require("../middleware/auth");
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

const updateNote = async (event) => {

    const username = event.username;
    const id =  event.pathParameters.id;

    if (!id) {
        return sendResponse(400, { success: false, message: 'ID is required' });
    }

    const {title,  text} = JSON.parse(event.body);
    
    if (!title || !text) {
        return sendResponse(400, { success: false, message: "Title and text are required" });
    }

    const params = {
        TableName: 'notes-db',
        Key: { username, id },
        UpdateExpression: 'set #title = :title, #text = :text, #modifiedAt = :modifiedAt',
        ConditionExpression: 'attribute_exists(username) AND attribute_exists(id) AND #isDeleted = :isDeleted',
        ExpressionAttributeNames: {
            '#title': 'title',
            '#text': 'text',
            '#modifiedAt': 'modifiedAt',
            '#isDeleted': 'isDeleted',
        },
        ExpressionAttributeValues: {
            ':title': title.trim(),
            ':text': text.trim(),
            ':modifiedAt': new Date().toISOString(),
            ':isDeleted': false,
        },
        ReturnValues: 'ALL_NEW',
    };

    try {
        const result = await db.update(params).promise();

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

const handler = middy(updateNote)
    .use(validateToken);


module.exports = {handler};