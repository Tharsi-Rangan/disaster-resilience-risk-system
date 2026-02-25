import api from "./api";

// expects backend: GET /api/projects
export const getProjects = async () => {
  const res = await api.get("/api/projects");
  return res.data;
};