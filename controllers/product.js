import Product from "../models/Product.js";
import APIFeatures from "../utils/apiFeatures.js";

export const getProducts = async (req, res) => {
  try {
    const features = new APIFeatures(Product.find(), req.query)
      .search()
      .filter()
      .sort()
      .paginate();

    const products = await features.query;

    res.json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSingleProduct= async(req,res)=>{
  const userId=req.body.params;
  


}