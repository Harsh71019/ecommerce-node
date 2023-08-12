import chai from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../server.js'; // Replace with your app instance
import Product from '../models/productModel.js'; // Replace with the correct path

chai.use(chaiHttp);
const expect = chai.expect;

describe('Product API', () => {
  let bearerToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZDYyNzQxYzFmMjMwM2ExY2RmYzJiNiIsImlhdCI6MTY5MTgyMTI4MSwiZXhwIjoxNjk0NDEzMjgxLCJqdGkiOiIyNDFkZTgyYTNmZmQ4ZWViZmI1Y2Y5YjBhNjczZWMwNiJ9.lXtIuyQ0TXS0rz-VBWl4TiNiDXagR1UlgtRbQ2doj0s';

  before(async () => {
    // Clear the Product collection or set up a testing database
    await Product.deleteMany({});
  });

  const dummyProductData = {
    name: 'Dummy Product',
    price: 20,
    description: 'This is a dummy product',
    // Fill in other fields
  };

  it('should create a new product', async () => {
    const res = await chai
      .request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send(dummyProductData);

    expect(res).to.have.status(201);
    expect(res.body).to.be.an('object');
    expect(res.body.name).to.equal(dummyProductData.name);
    // dummyProductId = res.body._id;
  });

  it('should get all products', async () => {
    await Product.create(dummyProductData);

    const res = await chai.request(app).get('/api/products');
    expect(res).to.have.status(200);
    expect(res.body.products).to.be.an('array');
    expect(res.body.products).to.have.lengthOf(1); // Assuming one product in the dummy data
    // Add more assertions for the response structure
  });

  it('should get a product by ID', async () => {
    const res = await chai.request(app).get(`/api/products/${dummyProductId}`);
    expect(res).to.have.status(200);
    expect(res.body).to.be.an('object');
    expect(res.body._id).to.equal(dummyProductId);
    // Add more assertions for other fields
  });

  it('should update a product', async () => {
    const updatedData = {
      description: 'Updated description',
      price: 25,
      // Fill in other updated fields
    };

    const res = await chai
      .request(app)
      .put(`/api/products/${dummyProductId}`)
      .set('Authorization', `Bearer ${bearerToken}`)
      .send(updatedData);
    expect(res).to.have.status(200);
    expect(res.body).to.be.an('object');
    // Add assertions for updated fields
  });

  it('should delete a product', async () => {
    const res = await chai
      .request(app)
      .delete(`/api/products/${dummyProductId}`)
      .set('Authorization', `Bearer ${bearerToken}`);
    expect(res).to.have.status(200);
    expect(res.body).to.be.an('object');
    expect(res.body.message).to.equal('Product removed');
  });
});
