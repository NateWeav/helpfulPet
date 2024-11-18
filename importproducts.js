// importProducts.js

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Define the Product schema
const productSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  category: String,
  sizes: [String],
  price: Number,
  weight: Number,
  weightUnit: String,
  image: String
});

// Create the Product model
const Product = mongoose.model('Product', productSchema);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/helpfulpet', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  importProducts();
}).catch(err => {
  console.error('Error connecting to MongoDB', err);
});

// Function to import products from JSON file
function importProducts() {
  const filePath = path.join(__dirname, 'products.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading products.json file', err);
      mongoose.disconnect();
      return;
    }

    const products = JSON.parse(data).products;

    Product.insertMany(products)
      .then(() => {
        console.log('Products imported successfully');
        mongoose.disconnect();
      })
      .catch(error => {
        console.error('Error importing products', error);
        mongoose.disconnect();
      });
  });
}