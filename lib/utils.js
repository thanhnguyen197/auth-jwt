// libraries
const crypto = require('crypto');
const jsonwebtoken = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// paths
const pathToKey = path.join(__dirname, '..', 'keys/private.pem');
const PRIV_KEY = fs.readFileSync(pathToKey, 'utf8');
const pathToPubKey = path.join(__dirname, '..', 'keys/public.pem');
const PUB_KEY = fs.readFileSync(pathToPubKey, 'utf8');

/**
 * -------------- HELPER FUNCTIONS ----------------
 */


/**
 * 
 * @param {*} password - The password string that the user inputs to the password field in the register form
 * 
 * This function takes a plain text password and creates a salt and hash out of it.  Instead of storing the plaintext
 * password in the database, the salt and hash are stored for security
 * 
 * ALTERNATIVE: It would also be acceptable to just use a hashing algorithm to make a hash of the plain text password.
 * You would then store the hashed password in the database and then re-hash it to verify later (similar to what we do here)
 */
const genPassword = (password) => {

    const salt = crypto.randomBytes(32).toString('hex');
    const genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

    return {
        salt,
        hash: genHash
    };
};


/**
 * 
 * @param {*} password - The plain text password
 * @param {*} hash - The hash stored in the database
 * @param {*} salt - The salt stored in the database
 * 
 * This function uses the crypto library to decrypt the hash using the salt and then compares
 * the decrypted hash/salt with the password that the user provided at login
 */
const validPassword = (password, hash, salt) => {

    const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

    return hash === hashVerify;
};


/**
 * @param {*} user - The user object.  We need this to set the JWT `sub` payload property to the MongoDB user ID
 */
const issueJWT = (user) => {
    const _id = user._id;

    const expiresIn = '1d';

    const payload = {
        sub: _id,
        iat: Date.now()
    };

    const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, {expiresIn: expiresIn, algorithm: 'RS256'});

    return {
        token: 'Bearer ' + signedToken,
        expires: expiresIn
    };
};

/** 
 * 
 * @param {*} req - request received from client
 * @param {*} res - response object
 * @param {*} next - next function
 * @returns 
*/
const authMiddleware = (req, res, next) => {
    
    const tokenParts = req.headers.authorization.split(' ');

    if (tokenParts[0] === 'Bearer' && tokenParts[1].match(/\S+\.\S+\.\S+/) !== null) {  
        try {

            const verification = jsonwebtoken.verify(tokenParts[1], PUB_KEY, {algorithms: ['RS256']});
            
            req.jwt = verification;
            next();
        } 
        catch (error) {
            res.status(401).json({success: false, msg: 'You are not authorized to access this route'});
           
        }
    }
    else {
        res.status(401).json({success: false, msg: 'Invalid token'});
    }

};

module.exports = {
    genPassword,
    validPassword,
    issueJWT,
    authMiddleware
};
