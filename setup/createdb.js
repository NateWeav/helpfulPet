// dbInit.js
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

// Product Schema matching server.js
const ProductSchema = new mongoose.Schema({
  productId: String,
  name: String,
  description: String,
  category: String,
  sizes: [String],
  price: Number,
  weight: Number,
  weightUnit: String,
  image: String
});

const Product = mongoose.model('Product', ProductSchema);

async function initializeDB() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/helpfulpet');
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Read products JSON file
    const productsData = await fs.readFile(
      path.join(__dirname, 'helpfulpet.products.json'), 
      'utf8'
    );
    const products = JSON.parse(productsData);

    // Insert products
    await Product.insertMany(products);
    console.log('Products imported successfully');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

initializeDB();