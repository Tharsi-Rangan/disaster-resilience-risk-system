import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, DollarSign, Calendar, Trash2, ArrowRight } from 'lucide-react'
import StatusBadge from './common/StatusBadge'

const ProjectCard = ({ project, onDelete }) => {
  const getProjectTypeIcon = (type) => {
    const icons = {
      bridge: '🌉',
      road: '🛣️',
      building: '🏢'
    }
    return icons[type?.toLowerCase()] || '🏗️'
  }

  const handleDelete = (e) => {
    e.preventDefault()
    if (window.confirm('Are you sure you want to delete this project?')) {
      onDelete(project._id)
    }
  }

  return (
    <Link to={`/projects/${project._id}`} className="group relative bg-white/90 glass-panel rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 p-6 flex flex-col h-full overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>

      <div className="flex justify-between items-start mb-6">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-slate-200 group-hover:bg-slate-800 transition-colors duration-300 group-hover:text-white">
          {getProjectTypeIcon(project.projectType)}
        </div>
        <StatusBadge label={project.status || 'DRAFT'} variant={project.status === 'APPROVED' ? 'success' : project.status === 'HIGH_RISK' ? 'error' : 'info'} />
      </div>

      <h3 className="text-2xl font-extrabold text-slate-900 heading-font mb-3 line-clamp-1 group-hover:text-slate-700 transition-colors">
        {project.title}
      </h3>
      
      <p className="text-sm font-medium text-slate-500 line-clamp-2 mb-6 flex-1">
        {project.description || 'No description provided.'}
      </p>

      <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-2xl shadow-inner border border-slate-100 group-hover:bg-slate-100/50 transition-colors">
        <div className="flex items-center text-sm font-bold text-slate-600">
          <MapPin className="w-4 h-4 mr-3 text-slate-400" />
          <span className="truncate">{project.location?.address || 'Location not set'}</span>
        </div>
        {project.budget && (
          <div className="flex items-center text-sm font-bold text-slate-600">
            <DollarSign className="w-4 h-4 mr-3 text-emerald-500" />
            <span>LKR {project.budget.toLocaleString()}</span>
          </div>
        )}
        {project.startDate && (
          <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 border-t border-slate-200/60 pt-2">
            <Calendar className="w-3.5 h-3.5 mr-2 text-slate-400" />
            {new Date(project.startDate).toLocaleDateString()}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
        <span className="text-xs font-bold text-slate-400">By {project.createdBy?.name || 'System'}</span>
        <button 
          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 z-10"
          onClick={handleDelete}
          title="Delete project"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </Link>
  )
}

export default ProjectCard
