import Product from "../model/Product.js";
import APIFeatures from "../utils/apiFeatures.js";
import { ApiError } from "../utils/errorHandler.js";
import { getRedisClient } from "../config/redis.js";

const CACHE_TTL = 300;

export const getProducts = async (req, res) => {
  try {
    const redisClient = getRedisClient();

    // Create a cache key based on query params
    const cacheKey = `products:${JSON.stringify(req.query)}`;
    const cachedProducts = await redisClient.get(cacheKey);

    if (cachedProducts) {
      // Return cached data
      return res.json({
        success: true,
        count: JSON.parse(cachedProducts).length,
        data: JSON.parse(cachedProducts)
      });
    }

    // Query database
    const features = new APIFeatures(Product.find(), req.query)
      .search()
      .filter()
      .sort()
      .paginate();

    const products = await features.query;

    // Store result in Redis
    await redisClient.set(cacheKey, JSON.stringify(products), { EX: CACHE_TTL });

    res.json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Get single product by ID (with caching)
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getSingleProduct = async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const productId = req.params.id;

    // Check cache first
    const cachedProduct = await redisClient.get(`product:${productId}`);
    if (cachedProduct) {
      return res.json({
        success: true,
        data: JSON.parse(cachedProduct)
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError('Product does not exist!!!', 404);
    }

    // Save in cache
    await redisClient.set(`product:${productId}`, JSON.stringify(product), { EX: CACHE_TTL });

    res.json({
      success: true,
      data: product
    });

  } catch (err) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
};
