const Router = require('express');
const router = new Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');

router.get('/search', productController.getAllByTextSearch);
router.post('/', productController.create);
router.post('/edit', productController.edit);
router.get('/', productController.getAll);
router.get('/getAll', productController.getAllProducts);
router.get('/:id', productController.getOne);
router.get('/info', productController.getProductInfo);
router.delete('/delete', authMiddleware, productController.deleteProduct);

module.exports = router;
