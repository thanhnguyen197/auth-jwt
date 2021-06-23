const fs = require('fs');
const path = require('path');
// const Strategy = require('passport-jwt').Strategy
// const ExtractJwt = require('passport-jwt').ExtractJwt;
const {Strategy, ExtractJwt} = require('passport-jwt')
const User = require('@models/user');

const pathToKey = path.join(__dirname, '..', 'keys/public.pem');
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');

// At a minimum, you must pass the `jwtFromRequest` and `secretOrKey` properties
const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: PUB_KEY,
    algorithms: ['RS256']
};

const configureJWTPassport = (passport) => {

    const strategy = new Strategy(options, (jwt_payload, done) => {
        console.log('check')
        console.log(jwt_payload);

        User.findOne({_id: jwt_payload.sub}, (err, user) => {

            if (err) {
                console.log('err 1', err);
                return done(err, false);
            }
            if (user) {
                console.log('user', user);
                return done(null, user);
            }
            else {
                console.log('no user');
                return done(null, false);
            }
        })
    });

    passport.use(strategy);
};

module.exports = configureJWTPassport;