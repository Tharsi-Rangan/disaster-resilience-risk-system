import { create } from 'zustand'

export const useProjectStore = create((set) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  addProject: (project) => set((state) => ({
    projects: [project, ...state.projects]
  })),
  
  updateProjectLocal: (id, updatedProject) => set((state) => ({
    projects: state.projects.map(p => p._id === id ? updatedProject : p),
    currentProject: state.currentProject?._id === id ? updatedProject : state.currentProject
  })),
  
  deleteProjectLocal: (id) => set((state) => ({
    projects: state.projects.filter(p => p._id !== id)
  })),
  
  clearError: () => set({ error: null }),
  clearCurrentProject: () => set({ currentProject: null })
}))
