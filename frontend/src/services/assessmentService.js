import api from "../api/axios";

export const runAssessment = async (projectId) => {
  const response = await api.post(`/assessments/run/${projectId}`);
  return response.data;
};

export const getLatestAssessment = async (projectId) => {
  const response = await api.get(`/assessments/${projectId}/latest`);
  return response.data;
};

export const getAssessmentHistory = async (projectId) => {
  const response = await api.get(`/assessments/${projectId}/history`);
  return response.data;
};

export const deleteAssessment = async (id) => {
  const response = await api.delete(`/assessments/${id}`);
  return response.data;
};