// config
require('dotenv').config();
require('module-alias/register');

// libraries
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const appRouter = require('@routes');
const configureJWTPassport = require('@config/passport');

const port = process.env.PORT || 3000;
const password = process.env.PASSWORD || '';

const app = express();

// middlewares
configureJWTPassport(passport);
app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static('@public'));
app.use(cors());

// router
app.use(appRouter)

// connect database
const connectionString = `mongodb+srv://thanhnguyen197:${password}@nodejsexpressproject.tjvfy.mongodb.net/AuthJWT?retryWrites=true&w=majority`;

mongoose
    .connect(connectionString, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log(('connected database'));
        app.listen(3000, () => console.log(`server listening on port ${port}`));
    })
    .catch((err) => console.log(err));