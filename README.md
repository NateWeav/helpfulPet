# Helpful Pet Store

A web-based pet store application with product management, shopping cart, and customer features.


## Features

- Product management (add/edit/delete products)
- Shopping cart functionality 
- Customer signup and login
- Product browsing and filtering
- Checkout process with:
  - Shipping selection
  - Billing details
  - Returns handling

## Setup Instructions

1. Install Node.js and MongoDB locally

2. Install dependencies:
```bash
npm install express mongoose body-parser bcrypt express-session
```

3. Initialize the database
```bash
node setup/createdb.js
```
4. Start the server

```bash
node server.js
```

5. Access the application at http://localhost:3000