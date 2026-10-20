import express from 'express';
import { readData, writeData } from '../data/db.js';

const router = express.Router();
const PRODUCTS_FILE = 'products.json';

// GET all products with optional filters, search, and sorting
router.get('/', (req, res) => {
  try {
    let products = readData(PRODUCTS_FILE, []);
    const { category, search, minPrice, maxPrice, minRating, inStock, sortBy } = req.query;

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categoryName?.toLowerCase().includes(q) ||
          p.tagline?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (category && category !== 'all') {
      products = products.filter((p) => p.category === category);
    }

    if (minPrice !== undefined && !isNaN(Number(minPrice))) {
      products = products.filter((p) => p.price >= Number(minPrice));
    }

    if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
      products = products.filter((p) => p.price <= Number(maxPrice));
    }

    if (minRating !== undefined && !isNaN(Number(minRating))) {
      products = products.filter((p) => (p.rating || 0) >= Number(minRating));
    }

    if (inStock === 'true') {
      products = products.filter((p) => p.inStock && p.stockCount > 0);
    }

    if (sortBy) {
      if (sortBy === 'price-low') {
        products.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-high') {
        products.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'rating') {
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (sortBy === 'newest') {
        products.sort((a, b) => {
          const aNew = a.badge === 'New Drop' || a.badge === 'New' ? 1 : 0;
          const bNew = b.badge === 'New Drop' || b.badge === 'New' ? 1 : 0;
          return bNew - aNew;
        });
      }
    }

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving products' });
  }
});

// GET categories with live counts
router.get('/categories', (req, res) => {
  try {
    const products = readData(PRODUCTS_FILE, []);
    const categories = [
      { id: 'all', name: 'All Products', icon: 'Sparkles', count: products.length },
      { id: 'audio-tech', name: 'Audio & Tech', icon: 'Headphones', count: products.filter(p => p.category === 'audio-tech').length },
      { id: 'apparel', name: 'Urban Apparel', icon: 'Shirt', count: products.filter(p => p.category === 'apparel').length },
      { id: 'smart-living', name: 'Smart Living', icon: 'Home', count: products.filter(p => p.category === 'smart-living').length },
      { id: 'accessories', name: 'Accessories', icon: 'Watch', count: products.filter(p => p.category === 'accessories').length },
    ];

    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving categories' });
  }
});

// GET product by ID
router.get('/:id', (req, res) => {
  try {
    const products = readData(PRODUCTS_FILE, []);
    const product = products.find((p) => p.id === req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving product' });
  }
});

// POST review to product
router.post('/:id/reviews', (req, res) => {
  try {
    const { author, rating, comment } = req.body;
    if (!author || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Author, rating, and comment are required' });
    }

    const products = readData(PRODUCTS_FILE, []);
    const productIndex = products.findIndex((p) => p.id === req.params.id);

    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const targetProduct = products[productIndex];
    const newReview = {
      id: `rev-${Date.now()}`,
      author: String(author).trim(),
      rating: Math.max(1, Math.min(5, Number(rating))),
      date: 'Just now',
      comment: String(comment).trim(),
      createdAt: new Date().toISOString(),
    };

    if (!targetProduct.reviews) {
      targetProduct.reviews = [];
    }

    targetProduct.reviews.unshift(newReview);
    targetProduct.reviewCount = targetProduct.reviews.length;

    // Recalculate average rating
    const totalRatingSum = targetProduct.reviews.reduce((sum, r) => sum + r.rating, 0);
    targetProduct.rating = Number((totalRatingSum / targetProduct.reviews.length).toFixed(1));

    products[productIndex] = targetProduct;
    writeData(PRODUCTS_FILE, products);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: newReview,
      product: targetProduct,
    });
  } catch (error) {
    console.error('Error posting review:', error);
    res.status(500).json({ success: false, message: 'Error saving review' });
  }
});

// POST create new product (Admin)
router.post('/', (req, res) => {
  try {
    const products = readData(PRODUCTS_FILE, []);
    const { name, tagline, category, categoryName, price, originalPrice, inStock, stockCount, images, description, colors, sizes, specs } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ success: false, message: 'Name, price, and category are required' });
    }

    const newId = `prod-${Date.now().toString(36)}`;
    const newProduct = {
      id: newId,
      name: name.trim(),
      tagline: tagline ? tagline.trim() : 'Premium Curated Essential',
      category: category.trim(),
      categoryName: categoryName || (category === 'audio-tech' ? 'Audio & Tech' : category === 'apparel' ? 'Urban Apparel' : category === 'smart-living' ? 'Smart Living' : 'Accessories'),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number((Number(price) * 1.25).toFixed(2)),
      discount: originalPrice && Number(originalPrice) > Number(price) ? Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100) : 0,
      rating: 5.0,
      reviewCount: 0,
      badge: 'New Drop',
      badgeType: 'new',
      inStock: inStock !== undefined ? Boolean(inStock) : true,
      stockCount: stockCount ? Number(stockCount) : 20,
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
      colors: colors || [{ name: 'Default', hex: '#18181b' }],
      sizes: sizes || [],
      description: description ? description.trim() : 'Crafted with premium materials and engineered for superior durability and everyday performance.',
      specs: specs || { 'Warranty': '2-Year Full Coverage', 'Material': 'Aerospace Grade' },
      reviews: [],
    };

    products.unshift(newProduct);
    writeData(PRODUCTS_FILE, products);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: newProduct,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Error adding product' });
  }
});

// PUT update product (Admin)
router.put('/:id', (req, res) => {
  try {
    const products = readData(PRODUCTS_FILE, []);
    const productIndex = products.findIndex((p) => p.id === req.params.id);

    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const current = products[productIndex];
    const updated = {
      ...current,
      ...req.body,
      price: req.body.price !== undefined ? Number(req.body.price) : current.price,
      stockCount: req.body.stockCount !== undefined ? Number(req.body.stockCount) : current.stockCount,
      inStock: req.body.stockCount !== undefined ? Number(req.body.stockCount) > 0 : (req.body.inStock !== undefined ? Boolean(req.body.inStock) : current.inStock),
    };

    products[productIndex] = updated;
    writeData(PRODUCTS_FILE, products);

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating product' });
  }
});

// DELETE product (Admin)
router.delete('/:id', (req, res) => {
  try {
    let products = readData(PRODUCTS_FILE, []);
    const exists = products.some((p) => p.id === req.params.id);

    if (!exists) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    products = products.filter((p) => p.id !== req.params.id);
    writeData(PRODUCTS_FILE, products);

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting product' });
  }
});

export default router;
