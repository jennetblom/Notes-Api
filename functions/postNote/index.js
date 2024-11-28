const { sendResponse } = require("../../responses");
const middy = require('@middy/core');
const { validateToken } = require("../middleware/auth");
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const { nanoid } = require('nanoid');


function checkTextLimit(title, text) {

    if (title.length > 50 && text.length > 300){
        return { success: false, message: 'Title and text are too long. Title should be max 50 characters and the text should be max 300 characters' };
    }
    else if(title.length > 50) {
        return { success: false, message: 'Title is too long. Title should be max 50 characters.' };
    } 
    else if(text.length > 300) {
        return { success: false, message: 'Text is too long. Text should be max 300 characters.' };
    } 
    else {
        return { success: true };
    }
}
const postNote = async (event) => {
    

    const{ title, text } = JSON.parse(event.body);

    const checkTextSize = checkTextLimit(title, text);
    if(!checkTextSize.success) {
        return sendResponse(400, { success: false, message: checkTextSize.message });
    }
    const username = event.username;
    const timestamp = new Date().toISOString();
    const id = nanoid(8);
   
    const params = {
        TableName: 'notes-db',
        Item : {
            username:username,
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
        return sendResponse(200, {success: true, message: 'Note created successfully'})
    } catch (error) {
        console.log(error);
        return sendResponse(500, {success: false, message: 'Could not create'});
    }
}

const handler = middy(postNote)
    .use(validateToken)


module.exports = { handler };   