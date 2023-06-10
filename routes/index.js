const Router = require('express');
const router = new Router();

const productRouter = require('./productRouter');
const brandRouter = require('./brandRouter');
const typeRouter = require('./typeRouter');
const userRouter = require('./userRouter');
const reviewRouter = require('./reviewRouter')

router.use('/brand', brandRouter);
router.use('/product', productRouter);
router.use('/type', typeRouter);
router.use('/user', userRouter);
router.use('/review', reviewRouter);

module.exports = router;
