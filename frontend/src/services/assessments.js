import api from "./api";

export const runAssessment = async (projectId, payload) => {
  const res = await api.post(`/api/assessments/run/${projectId}`, payload);
  return res.data;
};

export const getLatestAssessment = async (projectId) => {
  const res = await api.get(`/api/assessments/${projectId}/latest`);
  return res.data;
};

export const getAssessmentHistory = async (projectId) => {
  const res = await api.get(`/api/assessments/${projectId}/history`);
  return res.data;
};

export const getAssessmentById = async (id) => {
  const res = await api.get(`/api/assessments/by-id/${id}`);
  return res.data;
};

export const updateAssessment = async (id, payload) => {
  const res = await api.put(`/api/assessments/${id}`, payload);
  return res.data;
};

export const deleteAssessment = async (id) => {
  const res = await api.delete(`/api/assessments/${id}`);
  return res.data;
};