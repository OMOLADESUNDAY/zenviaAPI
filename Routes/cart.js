import express from 'express'
const router=express.Router()
router.get('/',getAllCart)
router.post('/add-to-cart',addCart)
router.patch('/update/:id',updateProduct)
router.get('/cart/:id',getSingleProduct)
router.delete('/cart/:id',deleteCart)
export default router