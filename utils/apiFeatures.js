class APIFeatures {
  constructor(query, queryString) {
    this.query = query;          // e.g. Product.find()
    this.queryString = queryString;  // e.g. req.query
  }

  // ===== SEARCH =====
  search() {
    if (this.queryString.search) {
      const search = this.queryString.search;

      this.query = this.query.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { brand: { $regex: search, $options: "i" } }
        ]
      });
    }

    return this;
  }

  // ===== FILTERING =====
  filter() {
    const queryObj = { ...this.queryString };

    // Remove reserved fields
    const removeFields = ["search", "sort", "page", "limit", "order"];
    removeFields.forEach(field => delete queryObj[field]);

    // Convert price filters: minPrice, maxPrice → price: { $gte, $lte }
    let filter = {};

    if (queryObj.minPrice || queryObj.maxPrice) {
      filter.price = {};
      if (queryObj.minPrice) filter.price.$gte = Number(queryObj.minPrice);
      if (queryObj.maxPrice) filter.price.$lte = Number(queryObj.maxPrice);
    }

    if (queryObj.category) {
      filter.category = queryObj.category;
    }

    if (queryObj.minRating) {
      filter.rating = { $gte: Number(queryObj.minRating) };
    }

    this.query = this.query.find(filter);

    return this;
  }

  // ===== SORTING =====
  sort() {
    if (this.queryString.sort) {
      const order = this.queryString.order === "desc" ? -1 : 1;
      let sortObj = {};
      sortObj[this.queryString.sort] = order;

      this.query = this.query.sort(sortObj);
    } else {
      this.query = this.query.sort({ createdAt: -1 });
    }

    return this;
  }

  // ===== PAGINATION =====
  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 20;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

export default APIFeatures;
