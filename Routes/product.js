import express from 'express'
const router=express.Router()
router.get('/product/:id',getSingleProduct)
router.get('/product',getAllProduct)
router.post('/product',addProduct)
export default router