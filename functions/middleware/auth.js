const jwt = require('jsonwebtoken');
const { sendResponse } = require('../../responses');



const validateToken = {
    before: async(request) => {
        try {

            const token = request.event.headers.authorization.replace('Bearer ', '');

            if (!token) throw new Error("Token is missing");

            const data = jwt.verify(token, 'aabbcc');

            request.event.id = data.id; 
            request.event.username = data.username;
            
            return request.response

        } catch(error) {
            
            if (error.name === 'TokenExpiredError') {
                return sendResponse(401, { success: false, message: 'Token expired, please log in again' });
            }
            console.log(error);
            return sendResponse(401, { success: false, message: error.message || 'Invalid token' });
        }

    }
}

module.exports = {validateToken};