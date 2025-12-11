import { ApiError } from "../utils/errorHandler.js";
import Cart from "../model/Cart.js";
export const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('products.product');

  if (!cart) {
    return res.status(200).json({ success: true, data: { products: [] } });
  }

  res.status(200).json({ success: true, data: cart });
};

export const getAllCart = async (req, res) => {
  const carts = await Cart.find().populate("user").populate("products.product");
  res.json({ success: true, data: carts });
};

export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity < 1) {
    throw new ApiError('Product ID and valid quantity are required.', 400);
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    // Create new cart for user
    cart = await Cart.create({
      user: req.user._id,
      products: [{ product: productId, quantity }],
    });
  } else {
    // Check if product already exists in cart
    const existingProduct = cart.products.find(p => p.product.toString() === productId);

    if (existingProduct) {
      existingProduct.quantity += quantity; // Increase quantity
    } else {
      cart.products.push({ product: productId, quantity });
    }

    await cart.save();
  }

  const updatedCart = await Cart.findById(cart._id).populate('products.product');

  res.status(200).json({ success: true, data: updatedCart });
};


export const updateCartProduct = async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity < 1) {
    throw new ApiError('Product ID and valid quantity are required.', 400);
  }

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    throw new ApiError('Cart not found.', 404);
  }

  const product = cart.products.find(p => p.product.toString() === productId);

  if (!product) {
    throw new ApiError('Product not found in cart.', 404);
  }

  product.quantity = quantity;

  await cart.save();

  const updatedCart = await Cart.findById(cart._id).populate('products.product');

  res.status(200).json({ success: true, data: updatedCart });
};


export const removeFromCart = async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    throw new ApiError('Cart not found.', 404);
  }

  const productIndex = cart.products.findIndex(p => p.product.toString() === productId);

  if (productIndex === -1) {
    throw new ApiError('Product not found in cart.', 404);
  }

  cart.products.splice(productIndex, 1);

  await cart.save();

  const updatedCart = await Cart.findById(cart._id).populate('products.product');

  res.status(200).json({ success: true, data: updatedCart });
};


export const clearCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    throw new ApiError('Cart not found.', 404);
  }

  cart.products = [];
  await cart.save();

  res.status(200).json({ success: true, data: cart });
};
