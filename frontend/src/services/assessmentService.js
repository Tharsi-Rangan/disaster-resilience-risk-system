import api from "../api/axios"; 
// if your project does not have src/api/axios.js, tell me.
// then we will use axios directly.

export const runAssessment = async (projectId) => {
  const response = await api.post(`/api/assessments/run/${projectId}`);
  return response.data;
};

export const getLatestAssessment = async (projectId) => {
  const response = await api.get(`/api/assessments/${projectId}/latest`);
  return response.data;
};

export const getAssessmentHistory = async (projectId) => {
  const response = await api.get(`/api/assessments/${projectId}/history`);
  return response.data;
};

export const deleteAssessment = async (id) => {
  const response = await api.delete(`/api/assessments/${id}`);
  return response.data;
};