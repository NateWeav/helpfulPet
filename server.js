// Install dependencies:
// npm install express mongoose body-parser

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();

// Serve static files from the 'public' directory
app.use(express.static('public'));
app.use(bodyParser.json());

// Session middleware
app.use(session({
    secret: 'supersecretkey', 
    resave: false,
    saveUninitialized: false
  }));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/helpfulpet');


const Schema = mongoose.Schema;

// Shopper Schema
const ShopperSchema = new Schema({
    name: String,
    email: { type: String, unique: true },
    phone: String,
    age: Number,
    address: String,
    password: String
  });

// Product Schema
const ProductSchema = new Schema({
  productId: String,
  name: String,
  description: String,
  category: String,
  unitOfMeasure: String,
  price: Number,
  weight: Number,
  image: String
});

// Shopping Cart Schema
const ShoppingCartSchema = new mongoose.Schema({
    shopperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shopper' },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number
      }
    ]
  });

// Order Schema (Shipping/Billing)
const OrderSchema = new Schema({
    shopperId: { type: Schema.Types.ObjectId, ref: 'Shopper' },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number
      }
    ],
    totalAmount: Number,
    status: String
  });

// Return Schema
const ReturnSchema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  products: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'Product' },
      reason: String
    }
  ],
  status: String
});

const ShippingSchema = new Schema({
  shopperId: { type: Schema.Types.ObjectId, ref: 'Shopper' },
  address: String,
  carrier: String,
  method: String,
  createdAt: { type: Date, default: Date.now }
});

const BillingSchema = new Schema({
  shopperId: { type: Schema.Types.ObjectId, ref: 'Shopper' },
  name: String,
  cardNumber: String,
  expiryDate: String,
  cvv: String,
  createdAt: { type: Date, default: Date.now }
});

// Models
const Shopper = mongoose.model('Shopper', ShopperSchema);
const Product = mongoose.model('Product', ProductSchema);
const ShoppingCart = mongoose.model('ShoppingCart', ShoppingCartSchema);
const Order = mongoose.model('Order', OrderSchema);
const Return = mongoose.model('Return', ReturnSchema);
const Shipping = mongoose.model('Shipping', ShippingSchema);
const Billing = mongoose.model('Billing', BillingSchema);

app.use(bodyParser.json());

// Shopper Routes
app.post('/signup', async (req, res) => {
    try {
      const { name, email, phone, age, address, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const newShopper = new Shopper({
        name,
        email,
        phone,
        age,
        address,
        password: hashedPassword
      });
      await newShopper.save();
      res.status(200).json({ message: 'Shopper registered successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to register shopper' });
    }
  });

  app.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const shopper = await Shopper.findOne({ email });
      if (!shopper) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }
      const isMatch = await bcrypt.compare(password, shopper.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }
      // Store shopper ID in session
      req.session.shopperId = shopper._id;
      res.status(200).json({ message: 'Login successful', shopperId: shopper._id });
    } catch (err) {
      res.status(500).json({ error: 'Failed to login' });
    }
  });

  // Logout route
    app.post('/logout', (req, res) => {
        req.session.destroy();
        res.status(200).json({ message: 'Logout successful' });
    });

// Product Routes
app.get('/products', async (req, res) => {
    try {
      const products = await Product.find();
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get products' });
    }
  });


// Order Routes
app.post('/checkout', async (req, res) => {
    try {
      const { shopperId } = req.body;
      const cart = await ShoppingCart.findOne({ shopperId }).populate('items.product');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }
      let totalAmount = 0;
      cart.items.forEach(item => {
        totalAmount += item.product.price * item.quantity;
      });
      const newOrder = new Order({
        shopperId,
        items: cart.items,
        totalAmount,
        status: 'Pending'
      });
      await newOrder.save();
      cart.items = [];
      await cart.save();
      res.status(200).json({ message: 'Checkout successful' });
    } catch (err) {
      console.error('Checkout error:', err);
      res.status(500).json({ error: 'Failed to checkout' });
    }
  });

// Return Routes
app.post('/returns', async (req, res) => {
  // Logic to handle returns
});

// Shopping Cart Routes
// Add item to cart
app.post('/cart/add', async (req, res) => {
    try {
      const { shopperId, productId, quantity } = req.body;
      let cart = await ShoppingCart.findOne({ shopperId });
      if (!cart) {
        cart = new ShoppingCart({ shopperId, items: [] });
      }
      const itemIndex = cart.items.findIndex(item => item.product.equals(productId));
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
      await cart.save();
      res.status(200).json({ message: 'Item added to cart' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to add item to cart' });
    }
  });
  
  // Get cart items
  app.get('/cart/:shopperId', async (req, res) => {
    try {
      const { shopperId } = req.params;
      const cart = await ShoppingCart.findOne({ shopperId }).populate('items.product');
      res.json(cart);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get cart items' });
    }
  });
  
  // Update item quantity
  app.post('/cart/update', async (req, res) => {
    try {
      const { shopperId, productId, quantity } = req.body;
      let cart = await ShoppingCart.findOne({ shopperId });
      if (!cart) return res.status(404).json({ error: 'Cart not found' });
      const itemIndex = cart.items.findIndex(item => item.product.equals(productId));
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
        if (cart.items[itemIndex].quantity <= 0) {
          cart.items.splice(itemIndex, 1);
        }
        await cart.save();
        res.status(200).json({ message: 'Cart updated' });
      } else {
        res.status(404).json({ error: 'Item not found in cart' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to update cart' });
    }
  });
  
  // Remove item from cart
  app.post('/cart/remove', async (req, res) => {
    try {
      const { shopperId, productId } = req.body;
      let cart = await ShoppingCart.findOne({ shopperId });
      if (!cart) return res.status(404).json({ error: 'Cart not found' });
      cart.items = cart.items.filter(item => !item.product.equals(productId));
      await cart.save();
      res.status(200).json({ message: 'Item removed from cart' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to remove item from cart' });
    }
  });

  app.get('/current-shopper', (req, res) => {
    if (req.session.shopperId) {
      res.json({ shopperId: req.session.shopperId });
    } else {
      res.status(401).json({ error: 'No active session' });
    }
  });

  app.post('/shipping', async (req, res) => {
    try {
        const shopperId = req.session.shopperId;
        if (!shopperId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { address, carrier, method } = req.body;
        const shipping = new Shipping({ shopperId, address, carrier, method });
        await shipping.save();
        res.status(200).json({ message: 'Shipping details saved' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save shipping details' });
    }
});

app.post('/billing', async (req, res) => {
  try {
      const shopperId = req.session.shopperId;
      if (!shopperId) {
          return res.status(401).json({ error: 'Unauthorized' });
      }

      const { name, cardNumber, expiryDate, cvv } = req.body;
      const billingDetails = new Billing({
          shopperId,
          name,
          cardNumber: `**** **** **** ${cardNumber.slice(-4)}`,
          expiryDate,
          cvv: '***' // Do not store CVV
      });

      await billingDetails.save();
      res.status(200).json({ message: 'Billing details saved' });
  } catch (err) {
      res.status(500).json({ error: 'Failed to save billing details' });
  }
});

app.get('/orders', async (req, res) => {
  try {
      const shopperId = req.session.shopperId;
      if (!shopperId) {
          return res.status(401).json({ error: 'Unauthorized' });
      }
      const orders = await Order.find({ shopperId }).populate('items.product');
      res.json(orders);
  } catch (err) {
      res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.post('/products', async (req, res) => {
  try {
      const product = new Product(req.body);
      await product.save();
      res.status(201).json(product);
  } catch (err) {
      res.status(500).json({ error: 'Failed to create product' });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
      const product = await Product.findById(req.params.id);
      if (!product) {
          return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
  } catch (err) {
      res.status(500).json({ error: 'Failed to get product' });
  }
});

app.put('/products/:id', async (req, res) => {
  try {
      const product = await Product.findByIdAndUpdate(
          req.params.id, 
          req.body,
          { new: true }
      );
      if (!product) {
          return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
  } catch (err) {
      res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/products/:id', async (req, res) => {
  try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
          return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ message: 'Product deleted successfully' });
  } catch (err) {
      res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.get('/', (req, res) => {
  res.redirect('/signup.html');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});