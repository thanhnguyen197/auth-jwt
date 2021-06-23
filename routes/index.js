const router = require('express').Router();
const userRouter = require('@routes/user');

router.get('/', (req, res) => {res.send('<h3>Hello again</h3>')})
router.use('/user', userRouter);

module.exports = router;