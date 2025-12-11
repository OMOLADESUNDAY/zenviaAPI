import express from "express";
import { getCategories, getCategory, getCategoryBySlug } from "../controllers/categories.js";

const router = express.Router();

// Normal users can only read categories
router.get("/", getCategories);               // GET /api/categories
router.get("/:id", getCategory);             // GET /api/categories/:id
router.get("/slug/:slug", getCategoryBySlug); // GET /api/categories/slug/:slug

export default router;
