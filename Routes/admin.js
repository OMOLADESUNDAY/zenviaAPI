import express from 'express'
const router=express.Router()
router.get('/admin/product/:id',getSingleProduct)
router.get('/admin/product',getAllProduct)
router.post('/admin/product',addProduct)
router.patch('/admin/product/update/:id',updateProduct)
router.delete('/admin/product/delete/:id',deleteProduct)
router.get('/admin/order',orders)
router.get('/admin/order/:id',orders)
router.get('/users',allUser)
router.delete('/admin/user/delete/:id',deleteProduct)
export default router