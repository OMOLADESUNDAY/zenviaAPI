import express from 'express'
const router=express.Router()
router.get('/',getAllOrder)
router.post('/product',MakeOrder)
router.patch('/order/status/:id',updateProduct)
router.get('/order/:id',getSingleProduct)
export default router