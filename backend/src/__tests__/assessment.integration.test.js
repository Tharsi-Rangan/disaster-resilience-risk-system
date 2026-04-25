const request = require("supertest");
const app = require("../app");

describe("Assessment API Integration", () => {
  const projectId = "69eb0c1b752f276a101de7e4";

  test("Run assessment API should require authentication", async () => {
    const res = await request(app).post(`/api/assessments/run/${projectId}`);

    expect(res.statusCode).toBe(401);
  });

  test("Get latest assessment API should require authentication", async () => {
    const res = await request(app).get(`/api/assessments/${projectId}/latest`);

    expect(res.statusCode).toBe(401);
  });
});