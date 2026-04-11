// tests/project.test.js
const request = require("supertest");
const app = require("../src/app"); // Express app
const mongoose = require("mongoose");
const User = require("../src/models/User");
const Project = require("../src/models/Project");
const jwt = require("jsonwebtoken");

// Mock geocode service to avoid real API calls
jest.mock("../src/services/geocode.service.js");

// Increase Jest timeout for slow DB operations
jest.setTimeout(30000); // 30 seconds

let userToken, adminToken;
let userId, adminId;

// Connect to MongoDB before running tests
beforeAll(async () => {
  if (!process.env.MONGO_URI_TEST) {
    throw new Error("MONGO_URI_TEST not set in .env.test");
  }

  await mongoose.connect(process.env.MONGO_URI_TEST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const dbName = mongoose.connection?.db?.databaseName || "";
  if (!dbName.toLowerCase().includes("test")) {
    throw new Error(`Unsafe test database detected: ${dbName || "unknown"}`);
  }
  console.log("Connected to MongoDB for tests");

  // Clear users/projects before tests
  await User.deleteMany({});
  await Project.deleteMany({});

  // Create normal user
  const user = await User.create({
    name: "CONTRACTOR",
    email: "contractor@test.com",
    password: "123456",
    role: "CONTRACTOR", // use actual enum role from User model
  });
  userId = user._id;
  userToken = jwt.sign({ _id: userId, role: "CONTRACTOR" }, process.env.JWT_SECRET);

  // Create admin user
  const admin = await User.create({
    name: "Admin",
    email: "admin@test.com",
    password: "123456",
    role: "ADMIN",
  });
  adminId = admin._id;
  adminToken = jwt.sign({ _id: adminId, role: "ADMIN" }, process.env.JWT_SECRET);
});

// Disconnect after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe("Project API Tests", () => {

  test("Create project successfully", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Kelani Bridge",
        projectType: "bridge",
        location: { address: "Colombo, Sri Lanka" }
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("Kelani Bridge");
    expect(res.body.status).toBe("DRAFT");
  });

  test("Fail without location", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Invalid Project",
        projectType: "road"
      });

    expect(res.statusCode).toBe(400);
  });

  test("Get all projects", async () => {
    const res = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.projects).toBeDefined();
  });

  test("Update project by owner", async () => {
    const project = await Project.create({
      title: "Road Project",
      projectType: "road",
      location: { address: "Colombo" },
      createdBy: userId
    });

    const res = await request(app)
      .put(`/api/projects/${project._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Road Project" });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Updated Road Project");
  });

  test("Non-owner cannot update", async () => {
    const project = await Project.create({
      title: "Building",
      projectType: "building",
      location: { address: "Colombo" },
      createdBy: userId
    });

    const res = await request(app)
      .put(`/api/projects/${project._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Hack Attempt" });

    expect(res.statusCode).toBe(403); // should fail for non-owner
  });

  test("Delete project by owner", async () => {
    const project = await Project.create({
      title: "Delete Me",
      projectType: "road",
      location: { address: "Colombo" },
      createdBy: userId
    });

    const res = await request(app)
      .delete(`/api/projects/${project._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });

  test("Admin can update status", async () => {
    const project = await Project.create({
      title: "Status Test",
      projectType: "road",
      location: { address: "Colombo" },
      createdBy: userId
    });

    const res = await request(app)
      .patch(`/api/projects/${project._id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "APPROVED" });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("APPROVED");
  });

});