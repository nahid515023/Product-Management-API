# Product Management API

A robust RESTful API built with Node.js, Express.js, TypeScript, and MongoDB for managing products and categories. This API provides comprehensive CRUD operations with advanced features like validation, pagination, search, error handling, and security middleware.

*Last updated: July 13, 2025*

## Table of Contents

- [Features](#features)
- [Data Model](#data-model)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)

## Features

- **Product Management**: Complete CRUD operations for products with advanced filtering
- **Category Management**: Organize products into hierarchical categories
- **Advanced Search & Filtering**: Search products by name, description, category, and status
- **Pagination Support**: Efficient data retrieval with customizable pagination
- **Dynamic Pricing**: Automatic discount calculation with detailed pricing breakdown
- **Data Validation**: Comprehensive input validation using Zod schema validation
- **Error Handling**: Structured error responses with detailed messaging and logging
- **Health Monitoring**: Built-in health check endpoints for system monitoring
- **Security Features**: CORS, Helmet, body parsing limits, and security headers
- **Request Logging**: Comprehensive request logging with Morgan middleware
- **TypeScript**: Full type safety and enhanced development experience
- **Auto-generated Product Codes**: Unique product identification system
- **Database Integration**: MongoDB with Mongoose ODM for robust data persistence
- **Environment Configuration**: Flexible configuration management for different environments

## Data Model

The application consists of two main entities: **Category** and **Product**, with a one-to-many relationship.

### Database Schema Diagram

![Database Schema](https://github.com/user-attachments/assets/8917aebc-7796-4985-8cfd-f7a095ff9ea8)

*Visual representation of the Category and Product entities with their relationships and field definitions.*

### Text-based Schema
```
┌─────────────────────────────────────┐        ┌─────────────────────────────────────┐
│              Category               │        │              Product                │
├─────────────────────────────────────┤        ├─────────────────────────────────────┤
│ _id: ObjectId (Primary Key)         │ ◄──────┤ _id: ObjectId (Primary Key)         │
│ name: String (Required, Unique)     │   1:N  │ name: String (Required)             │
│ description: String (Optional)      │        │ description: String (Required)      │
│ createdAt: Date (Auto-generated)    │        │ price: Number (Required, Min: 0)    │
│ updatedAt: Date (Auto-generated)    │        │ discount: Number (0-100, Default: 0)│
└─────────────────────────────────────┘        │ image: String (Required, URL)       │
                                               │ status: Enum ['In Stock', 'Out']    │
                                               │ productCode: String (Unique)        │
                                               │ category: ObjectId (Foreign Key)    │
                                               │ categoryName: String (Denormalized) │
                                               │ createdAt: Date (Auto-generated)    │
                                               │ updatedAt: Date (Auto-generated)    │
                                               └─────────────────────────────────────┘
```

### Entity Relationships

- **One-to-Many**: One Category can have multiple Products
- **Foreign Key**: Product.category references Category._id
- **Denormalization**: Product.categoryName stores category name for performance
- **Referential Integrity**: Category validation ensures valid category assignment

### Key Constraints

- **Category.name**: Must be unique across all categories
- **Product.productCode**: Auto-generated unique identifier
- **Product.price**: Must be non-negative
- **Product.discount**: Range 0-100 percentage
- **Product.image**: Must be a valid URL format
- **Product.status**: Enumerated values for inventory tracking

## Technologies Used

- **Runtime Environment**: Node.js (Latest LTS)
- **Web Framework**: Express.js 5.1.0
- **Programming Language**: TypeScript 5.8.3
- **Database**: MongoDB with Mongoose ODM 8.16.3
- **Schema Validation**: Zod 4.0.5
- **Security Middleware**: 
  - Helmet 8.1.0 (Security headers)
  - CORS 2.8.5 (Cross-origin resource sharing)
- **HTTP Parsing**: Body-parser 2.2.0
- **Request Logging**: Morgan 1.10.0
- **Environment Management**: Dotenv 17.2.0
- **Development Tools**:
  - Nodemon 3.1.10 (Auto-restart)
  - ts-node 10.9.2 (TypeScript execution)
- **Testing Framework**: Jest 30.0.4 with Supertest 7.1.3
- **Type Definitions**: Complete TypeScript support for all dependencies

## Project Structure

```
src/
├── app.ts                 # Application entry point and server configuration
├── config/
│   └── index.ts          # Environment variables and configuration management
├── controllers/
│   ├── category.ts       # Category business logic and CRUD operations
│   ├── health.ts         # Health check controller
│   └── product.ts        # Product business logic and CRUD operations
├── middleware/
│   ├── errorHandler.ts   # Global error handling and custom error types
│   └── validation.ts     # Zod schema validation middleware
├── models/
│   ├── category.ts       # Category MongoDB schema and model
│   └── product.ts        # Product MongoDB schema and model
├── routes/
│   ├── category.ts       # Category API route definitions
│   ├── health.ts         # Health check route definitions
│   ├── index.ts          # Root router and route aggregation
│   └── product.ts        # Product API route definitions
└── utils/
    ├── connectDB.ts      # MongoDB connection utility and configuration
    └── generateProductCode.ts # Unique product code generation utility
```
│   ├── index.ts          # Route aggregation
│   └── product.ts        # Product route definitions
└── utils/
    ├── connectDB.ts      # Database connection utility
    └── generateProductCode.ts # Product code generator
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create environment file
   cp .env.example .env
   # Edit .env with your specific configuration
   ```

4. **Database Setup**
   ```bash
   # Option 1: Local MongoDB
   # Make sure MongoDB is installed and running
   mongod
   
   # Option 2: MongoDB Atlas
   # Use your MongoDB Atlas connection string in .env
   ```

5. **Run the application**
   ```bash
   # Development mode with hot reload
   npm run dev
   
   # Build for production
   npm run build
   
   # Start production server
   npm start
   ```

6. **Verify Installation**
   ```bash
   # Check health endpoint
   curl http://localhost:3000/health
   ```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/your-database

# Security Configuration
JWT_SECRET=your-super-secure-secret-key-here
```

### Environment Variables

| Variable | Description | Default Value | Required |
|----------|-------------|---------------|----------|
| `PORT` | Server port number | 3000 | No |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/your-database | Yes |
| `NODE_ENV` | Environment mode (development/production) | development | No |
| `JWT_SECRET` | Secret key for JWT tokens | HiMyNameIsNahid | No |

### Configuration Notes

- **Production**: Always use a strong `JWT_SECRET` in production
- **Database**: MongoDB URI supports both local and cloud (Atlas) connections
- **Port**: Ensure the port is available and not blocked by firewall
- **Environment**: Set `NODE_ENV=production` for production deployments

## API Endpoints

### Health Check
- `GET /health` - System health status and API availability

### Categories
- `POST /category` - Create a new category
- `GET /category` - Get all categories with pagination support
- `GET /category/query?id={id}` - Get specific category by ID
- `PUT /category/query?id={id}` - Update existing category
- `DELETE /category/query?id={id}` - Delete category (if no products associated)

### Products
- `POST /product` - Create a new product
- `GET /product` - Get all products with advanced filtering and pagination
- `GET /product/{id}` - Get specific product by ID with pricing details
- `PUT /product/{id}` - Update existing product
- `DELETE /product/{id}` - Delete product

### Query Parameters

#### Product Listing (`GET /product`)
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number for pagination | 1 |
| `limit` | number | Items per page | 10 |
| `search` | string | Search in product name and description | - |
| `category` | string | Filter by category ID | - |
| `status` | string | Filter by status ('In Stock', 'Stock Out') | - |
| `sortBy` | string | Sort field (name, price, createdAt, updatedAt) | createdAt |
| `sortOrder` | string | Sort direction (asc, desc) | desc |

#### Category Listing (`GET /category`)
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number for pagination | 1 |
| `limit` | number | Items per page | 10 |

## Usage Examples

### Health Check
```bash
curl http://localhost:3000/health
```

### Create a Category
```bash
curl -X POST http://localhost:3000/category \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Electronics",
    "description": "Electronic devices and gadgets"
  }'
```

### Create a Product
```bash
curl -X POST http://localhost:3000/product \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smartphone",
    "description": "Latest model smartphone with advanced features",
    "price": 699.99,
    "discount": 15,
    "image": "https://example.com/images/smartphone.jpg",
    "status": "In Stock",
    "categoryId": "60d5ecb74a2d5b001f5c8c4e"
  }'
```

### Search and Filter Products
```bash
# Search with multiple filters
curl "http://localhost:3000/product?search=phone&category=60d5ecb74a2d5b001f5c8c4e&status=In Stock&page=1&limit=5&sortBy=price&sortOrder=asc"

# Get products with pagination
curl "http://localhost:3000/product?page=2&limit=20"
```

### Update Product
```bash
curl -X PUT http://localhost:3000/product/60d5ecb74a2d5b001f5c8c4f \
  -H "Content-Type: application/json" \
  -d '{
    "price": 649.99,
    "discount": 20,
    "status": "Stock Out"
  }'
```

### Response Format

All API responses follow this consistent structure:

```json
{
  "success": boolean,
  "message": string,
  "data": object | array | null,
  "pagination": {
    "currentPage": number,
    "totalPages": number,
    "totalProducts": number,
    "limit": number,
    "hasNextPage": boolean,
    "hasPrevPage": boolean
  }
}
```

### Health Check Response
```json
{
  "success": true,
  "message": "API is running successfully",
  "data": {
    "status": "healthy",
    "timestamp": "2025-07-13T12:00:00.000Z",
    "uptime": "2 hours 15 minutes",
    "environment": "development"
  }
}
```

### Product Response with Enhanced Pricing
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "_id": "60d5ecb74a2d5b001f5c8c4f",
    "name": "Smartphone",
    "description": "Latest model smartphone with advanced features",
    "price": 699.99,
    "discount": 15,
    "image": "https://example.com/images/smartphone.jpg",
    "status": "In Stock",
    "productCode": "abc123456-7890-def",
    "category": {
      "_id": "60d5ecb74a2d5b001f5c8c4e",
      "name": "Electronics"
    },
    "categoryName": "Electronics",
    "pricing": {
      "originalPrice": 699.99,
      "discountPercentage": 15,
      "discountAmount": 105.00,
      "finalPrice": 594.99,
      "savings": 105.00,
      "hasDiscount": true
    },
    "createdAt": "2025-07-13T10:30:00.000Z",
    "updatedAt": "2025-07-13T10:30:00.000Z"
  }
}
```

## Error Handling

The API implements comprehensive error handling with structured, consistent error responses:

### Error Response Format
```json
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Validation failed",
    "code": "FIELD_REQUIRED",
    "details": [
      {
        "field": "name",
        "message": "Product name is required",
        "code": "too_small"
      }
    ]
  },
  "timestamp": "2025-07-13T12:00:00.000Z",
  "path": "/product",
  "method": "POST"
}
```

### Error Types and HTTP Status Codes

| Error Type | HTTP Status | Description |
|------------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failures (Zod schema validation) |
| `NOT_FOUND_ERROR` | 404 | Resource not found (invalid IDs, deleted resources) |
| `DUPLICATE_ERROR` | 409 | Unique constraint violations (duplicate names, codes) |
| `REFERENCE_ERROR` | 400 | Invalid references (non-existent category IDs) |
| `DATABASE_ERROR` | 503 | Database connection or operation failures |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server errors |

### Common Error Scenarios

#### Validation Error Example
```json
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "price",
        "message": "Price must be a positive number"
      },
      {
        "field": "image",
        "message": "Image must be a valid URL"
      }
    ]
  }
}
```

#### Not Found Error Example
```json
{
  "success": false,
  "error": {
    "type": "NOT_FOUND_ERROR",
    "message": "Product not found",
    "code": "RESOURCE_NOT_FOUND"
  }
}
```

## Development Scripts

```bash
# Development server with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server (requires build first)
npm start

# Clean build directory
npm run clean

# Clean and rebuild
npm run build:clean

# Run tests (when implemented)
npm test

# Install dependencies
npm install

# Update dependencies
npm update
```

### Development Workflow

1. **Development**: Use `npm run dev` for development with auto-restart
2. **Testing**: Run `npm test` to execute test suites
3. **Building**: Use `npm run build` to compile TypeScript
4. **Production**: Use `npm start` to run the compiled application

### Project Scripts Explanation

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `nodemon src/app.ts` | Development server with auto-restart |
| `build` | `tsc` | Compile TypeScript to JavaScript |
| `start` | `node dist/app.js` | Start production server |
| `clean` | `rm -rf dist` | Remove build directory |
| `build:clean` | `npm run clean && npm run build` | Clean and rebuild |



