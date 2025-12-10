import express from 'express'
import { getProducts,getSingleProduct } from '../controllers/product.js'
const router=express.Router()
router.get('/:id',getSingleProduct)
router.get('/',getProducts)
export default router