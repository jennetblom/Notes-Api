
import { sendResponse } from '../../responses/index.js';
import jwt from 'jsonwebtoken';
import AWS from 'aws-sdk';


const db = new AWS.DynamoDB.DocumentClient();

export const validateToken = {
    before: async(request) => {
        try {

            console.log("Middleware 'before' started");
            const token = request.event.headers.authorization.replace('Bearer ', '');

            if (!token) throw new Error("Token is missing");

            const data = jwt.verify(token, 'aabbcc');
            console.log("Token verified successfully:", data);

            request.event.id = data.id; 
            request.event.username = data.username;
            
            // return request.response

        } catch(error) {
            
            if (error.name === 'TokenExpiredError') {
                return sendResponse(401, { success: false, message: 'Token expired, please log in again' });
            }
            console.log(error);
            return sendResponse(401, { success: false, message: error.message || 'Invalid token' });
        }

    }
};

