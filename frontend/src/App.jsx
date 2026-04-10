import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProjectsList from './pages/projects/ProjectsList'
import ProjectDetails from './pages/projects/ProjectDetails'
import CreateProject from './pages/projects/CreateProject'
import EditProject from './pages/projects/EditProject'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/projects" replace />} />
            <Route path="/projects" element={<ProjectsList />} />
            <Route path="/projects/new" element={<CreateProject />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/projects/:id/edit" element={<EditProject />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
