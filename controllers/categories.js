import Category from "../model/Category.js";
import { connectRedis } from "../config/redis.js";

const CACHE_KEY = "user:categories";

// GET all categories (with caching)
export const getCategories = async (req, res) => {
  const redis = await connectRedis();

  // Check cache
  const cached = await redis.get(CACHE_KEY);
  if (cached) return res.json({ success: true, source: "cache", data: JSON.parse(cached) });

  // Fetch from DB
  const categories = await Category.find().sort({ name: 1 }); // alphabetical order

  // Cache for 10 minutes
  await redis.setEx(CACHE_KEY, 600, JSON.stringify(categories));

  res.json({ success: true, source: "db", data: categories });
};

// GET single category by ID
export const getCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: "Category not found" });

  res.json({ success: true, data: category });
};

// GET single category by slug (optional)
export const getCategoryBySlug = async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) return res.status(404).json({ success: false, message: "Category not found" });

  res.json({ success: true, data: category });
};
