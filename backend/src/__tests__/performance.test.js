const request = require("supertest");
const app = require("../app");

describe("Performance Test", () => {
  const projectId = "69eb0c1b752f276a101de7e4";

  test("Protected latest assessment API responds within 2 seconds", async () => {
    const start = Date.now();

    const res = await request(app).get(`/api/assessments/${projectId}/latest`);

    const duration = Date.now() - start;

    expect(res.statusCode).toBe(401);
    expect(duration).toBeLessThan(2000);
  });
});
//npx jest assessment.calc.test.js assessment.integration.test.js performance.test.js