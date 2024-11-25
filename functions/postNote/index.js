const { sendResponse } = require("../../responses");
const middy = require('@middy/core');
const { validateToken } = require("../middleware/auth");
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');


function checkTextLimit(title, text) {

    if(title.length > 50) {
        return false;
    } 
    else if(text.length>300) {
        return false;
    } else {
        return true;
    }


}
const postNote = async (event) => {
    
  
    //an note should contain:
    //id, title, text, createdAt and modifiedAt

    if (event?.error && event?.error === '401') {
        return sendResponse(401, { success: false, message: 'Invalid token' });
    }
    const{ title, text } = JSON.parse(event.body);

    const checkTextSize = checkTextLimit(title, text);
    if(!checkTextSize) {
        return sendResponse(400, { success: false, message: 'Title or text are too long. Title should be max 50 characters and the text should be max 300 characters' });
    }
    const username = event.username;
    const timestamp = new Date().toISOString();
    const id = uuidv4();
   
    const params = {
        TableName: 'notes-db',
        Item : {
            username:username,
            id: id,
            title: title,
            text: text,
            createdAt: timestamp,
            modifiedAt: timestamp
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