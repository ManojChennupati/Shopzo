import request from 'supertest';
import { expect } from 'chai';

const BASE_URL = 'http://localhost:8080';

describe('Backend API Tests', () => {
  let authToken;
  let productId;
  let testEmail;

  // Test 1: User Registration
  it('should register a new user', async () => {
    testEmail = `test${Date.now()}@example.com`;
    const res = await request(BASE_URL)
      .post('/auth/register')
      .send({
        name: 'Test User',
        email: testEmail,
        password: 'Test@123',
        phone: '+1234567890',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          country: 'USA',
          zipCode: '12345'
        }
      });
    
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('token');
    expect(res.body.user).to.have.property('email');
  });

  // Test 2: User Login
  it('should login with valid credentials', async () => {
    const res = await request(BASE_URL)
      .post('/auth/login')
      .send({
        email: testEmail,
        password: 'Test@123'
      });
    
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('token');
    authToken = res.body.token;
  });

  // Test 3: Get All Products
  it('should fetch all active products', async () => {
    const res = await request(BASE_URL)
      .get('/products')
      .query({ page: 1, limit: 10 });
    
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('products');
    expect(res.body.products).to.be.an('array');
    if (res.body.products.length > 0) {
      productId = res.body.products[0]._id;
    }
  });

  // Test 4: Add Product to Cart
  it('should add a product to cart', async () => {
    const res = await request(BASE_URL)
      .post('/cart')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        productId: productId,
        quantity: 2
      });
    
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('cart');
    expect(res.body.cart.items).to.be.an('array');
  });

  // Test 5: Get User Cart
  it('should retrieve user cart with items', async () => {
    const res = await request(BASE_URL)
      .get('/cart')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('items');
    expect(res.body.totalItems).to.be.a('number');
  });
});
