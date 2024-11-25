import jwt from 'jsonwebtoken';



const validateToken = {
    before: async(request) => {
        try {

            const token = request.event.headers.authorization.replace('Bearer ', '');

            if (!token) throw new Error();

            const data = jwt.verify(token, 'aabbcc');

            request.event.id = data.id; 
            request.event.username = data.username;
            
            return request.response

        } catch(error) {
            request.event.error  = '401';

            return request.response
        }

    }
}

module.exports = {validateToken};