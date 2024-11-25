const { sendResponse } = require("../../responses");
import middy from '@middy/core';
const { validateToken } = require("../middleware/auth");


const getNotes = async (event) => {

    if (event?.error && event?.error === '401') {
        return sendResponse(400, { success: false, message: 'Invalid token' });
    }

    const username = event.username;

    return sendResponse(200, { message: `Hej ${username} hallå elller???` })
}

const handler = middy(getNotes)
    .use(validateToken)


module.exports = { handler };   