// libraries
const router = require('express').Router();

// models
const User = require('@models/user');

// utils
const {
    genPassword, 
    validPassword, 
    issueJWT,
    authMiddleware
} = require('@lib/utils');

/**
 * -------------- GET ROUTES ----------------
 */
router.get('/', (req, res) => {
    console.log('checking user router');
    res.send('<h1>user</h1>')
});

router.get('/register', (req, res, next) => {

    const form = '<h1>Register Page</h1><form method="post" action="/user/register">\
                    Enter Username:<br><input type="text" name="username">\
                    <br>Enter Password:<br><input type="password" name="password">\
                    <br><br><input type="submit" value="Submit"></form>';

    res.send(form);
    
});

router.get('/login', (req, res, next) => {
   
    const form = '<h1>Login Page</h1><form method="POST" action="/user/login">\
    Enter Username:<br><input type="text" name="username">\
    <br>Enter Password:<br><input type="password" name="password">\
    <br><br><input type="submit" value="Submit"></form>';

    res.send(form);

});


/**
 * -------------- POST ROUTES ----------------
 */

// register a new user
router.post('/register', (req, res, next) => {
    const {salt, hash} = genPassword(req.body.password);

    const newUser = new User({
        username: req.body.username,
        salt: salt,
        hash: hash
    });

    try {
        newUser
            .save()
            .then((user) => res.status(201).json({success: true, user: user}))   
    } 
    catch (error) {
        next(error);
    }
});


// Validate an existing user and issue a JWT
router.post('/login', (req, res, next) => {

    User
        .findOne({username: req.body.username})
        .then(user => {
            const {salt, hash} = user;

            if (!user) {
                return res.status(404).json({success: false, msg: 'Could not found user'});
            }

            const isValid = validPassword(req.body.password, hash, salt);

            if (isValid) {  
                const {token, expires} = issueJWT(user);

                res.status(200).json({success: true, token, expiresIn: expires});
            }
            else {
                res.status(401).json({ success: false, msg: "you entered the wrong password" });
            }
        })
        .catch(err => next(err));
});


/**
 * -------------- PRIVATE ROUTES ----------------
 */

router.get('/protected', authMiddleware, (req, res, next) => {
    res.status(200).json({ success: true, msg: "You are successfully authenticated to this route!"});
});


module.exports = router;