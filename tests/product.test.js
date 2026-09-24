const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const Product = require("../models/Product");

// Increase timeout for CI environments
jest.setTimeout(30000);

// Connect to test database before all tests
beforeAll(async () => {
  const mongoUri =
    process.env.MONGO_URI || "mongodb://localhost:27017/productdb_test";
  await mongoose.connect(mongoUri);
});

// Clean up the collection before each test
beforeEach(async () => {
  await Product.deleteMany({});
});

// Disconnect after all tests
afterAll(async () => {
  await Product.deleteMany({});
  await mongoose.connection.close();
});

describe("Product API CRUD Tests", () => {
  const sampleProduct = {
    pid: "P001",
    pname: "Laptop Dell XPS 15",
    price: 1500,
    quantity: 10,
  };

  // ==================== CREATE ====================
  describe("POST /api/products", () => {
    it("should create a new product", async () => {
      const res = await request(app)
        .post("/api/products")
        .send(sampleProduct)
        .expect(201);

      expect(res.body).toHaveProperty("_id");
      expect(res.body.pid).toBe(sampleProduct.pid);
      expect(res.body.pname).toBe(sampleProduct.pname);
      expect(res.body.price).toBe(sampleProduct.price);
      expect(res.body.quantity).toBe(sampleProduct.quantity);
    });

    it("should return 400 if pid already exists", async () => {
      await Product.create(sampleProduct);

      const res = await request(app)
        .post("/api/products")
        .send(sampleProduct)
        .expect(400);

      expect(res.body.message).toContain("already exists");
    });

    it("should return 400 if required fields are missing", async () => {
      const res = await request(app)
        .post("/api/products")
        .send({ pid: "P002" })
        .expect(400);

      expect(res.body).toHaveProperty("message");
    });

    it("should return 400 if price is negative", async () => {
      const res = await request(app)
        .post("/api/products")
        .send({ ...sampleProduct, pid: "P003", price: -100 })
        .expect(400);

      expect(res.body).toHaveProperty("message");
    });
  });

  // ==================== READ ====================
  describe("GET /api/products", () => {
    it("should return an empty array when no products exist", async () => {
      const res = await request(app).get("/api/products").expect(200);

      expect(res.body).toEqual([]);
    });

    it("should return all products", async () => {
      await Product.create(sampleProduct);
      await Product.create({
        pid: "P002",
        pname: "MacBook Pro",
        price: 2500,
        quantity: 5,
      });

      const res = await request(app).get("/api/products").expect(200);

      expect(res.body).toHaveLength(2);
    });
  });

  describe("GET /api/products/:pid", () => {
    it("should return a single product by pid", async () => {
      await Product.create(sampleProduct);

      const res = await request(app)
        .get(`/api/products/${sampleProduct.pid}`)
        .expect(200);

      expect(res.body.pid).toBe(sampleProduct.pid);
      expect(res.body.pname).toBe(sampleProduct.pname);
    });

    it("should return 404 if product not found", async () => {
      const res = await request(app)
        .get("/api/products/NONEXISTENT")
        .expect(404);

      expect(res.body.message).toBe("Product not found");
    });
  });

  // ==================== UPDATE ====================
  describe("PUT /api/products/:pid", () => {
    it("should update an existing product", async () => {
      await Product.create(sampleProduct);

      const updatedData = {
        pname: "Dell XPS 15 (Updated)",
        price: 1800,
        quantity: 15,
      };

      const res = await request(app)
        .put(`/api/products/${sampleProduct.pid}`)
        .send(updatedData)
        .expect(200);

      expect(res.body.pname).toBe(updatedData.pname);
      expect(res.body.price).toBe(updatedData.price);
      expect(res.body.quantity).toBe(updatedData.quantity);
      expect(res.body.pid).toBe(sampleProduct.pid); // pid unchanged
    });

    it("should return 404 if product to update not found", async () => {
      const res = await request(app)
        .put("/api/products/NONEXISTENT")
        .send({ pname: "Test", price: 100, quantity: 1 })
        .expect(404);

      expect(res.body.message).toBe("Product not found");
    });

    it("should return 400 if update data is invalid", async () => {
      await Product.create(sampleProduct);

      const res = await request(app)
        .put(`/api/products/${sampleProduct.pid}`)
        .send({ price: -500 })
        .expect(400);

      expect(res.body).toHaveProperty("message");
    });
  });

  // ==================== DELETE ====================
  describe("DELETE /api/products/:pid", () => {
    it("should delete an existing product", async () => {
      await Product.create(sampleProduct);

      const res = await request(app)
        .delete(`/api/products/${sampleProduct.pid}`)
        .expect(200);

      expect(res.body.message).toBe("Product deleted successfully");

      // Verify product is deleted
      const check = await request(app)
        .get(`/api/products/${sampleProduct.pid}`)
        .expect(404);

      expect(check.body.message).toBe("Product not found");
    });

    it("should return 404 if product to delete not found", async () => {
      const res = await request(app)
        .delete("/api/products/NONEXISTENT")
        .expect(404);

      expect(res.body.message).toBe("Product not found");
    });
  });

  // ==================== HEALTH CHECK ====================
  describe("GET /health", () => {
    it("should return health status", async () => {
      const res = await request(app).get("/health").expect(200);

      expect(res.body.status).toBe("OK");
      expect(res.body.service).toBe("product-api");
      expect(res.body.database).toBe("connected");
      expect(res.body).toHaveProperty("timestamp");
    });
  });
});
