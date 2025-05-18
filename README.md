Odoo Hackathon Project

# EcoFinds - Sustainable E-commerce Platform

EcoFinds is a modern e-commerce platform focused on sustainable and eco-friendly products. Built with React, Flask, and MongoDB, it provides a seamless shopping experience with robust features for both buyers and sellers.

## Features

### User Management
- Secure user authentication with JWT
- User profile management
- Email verification with OTP
- Profile picture support

### Product Management
- Create, read, update, and delete product listings
- Rich product details including:
  - Title and description
  - Category classification
  - Pricing and inventory
  - Product condition
  - Manufacturing details
  - Dimensions and weight
  - Original packaging status
  - Manual availability
  - Multiple image support

### Shopping Experience
- Intuitive product browsing
- Advanced search functionality
- Category-based filtering
- Responsive product grid
- Pagination support
- Real-time cart management
- Quantity adjustments
- Order total calculation

### User Dashboard
- Personal profile overview
- Product listings management
- Shopping cart status
- Purchase history

## Technology Stack

### Frontend
- React.js
- Tailwind CSS for styling
- Axios for API communication
- Lucide React for icons
- JWT for authentication

### Backend
- Flask (Python)
- MongoDB with MongoEngine ODM
- Flask-JWT-Extended for authentication
- Flask-Mail for email services
- AWS S3 for image storage
- BCrypt for password hashing

## Installation

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8+
- MongoDB
- AWS Account (for S3 storage)

### Backend Setup
1. Navigate to the server directory:
```bash
cd server
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configurations:
# - MongoDB connection string
# - JWT secret key
# - AWS credentials
# - Email service credentials
```

5. Run the server:
```bash
python run.py
```

### Frontend Setup
1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configurations
```

4. Start the development server:
```bash
npm start
```

## API Endpoints

### Authentication
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- POST /api/auth/verify-otp - Email verification

### Products
- GET /api/products - List products
- POST /api/products - Create product
- GET /api/products/:id - Get product details
- PUT /api/products/:id - Update product
- DELETE /api/products/:id - Delete product

### Cart
- GET /api/cart - Get cart items
- POST /api/cart/add - Add item to cart
- PUT /api/cart/update/:id - Update cart item
- DELETE /api/cart/remove/:id - Remove cart item
- DELETE /api/cart/clear - Clear cart

### Profile
- GET /api/profile - Get user profile
- PUT /api/profile - Update profile
- GET /api/profile/listings - Get user listings

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- MongoDB Atlas for database hosting
- AWS S3 for image storage
- Tailwind CSS for the UI framework
- React community for the amazing ecosystem
