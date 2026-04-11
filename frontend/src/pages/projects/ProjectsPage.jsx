import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, MapPin, Calendar, DollarSign, Filter, Building, Activity, LayoutTemplate, BriefcaseBusiness, ArrowRight } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { projectService } from '../../services/projectService';

const normalizeProjects = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.projects)) return payload.projects;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await projectService.getProjects(1, 100);
      setProjects(normalizeProjects(response));
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects = (Array.isArray(projects) ? projects : []).filter((project) => {
    const title = String(project?.title || '').toLowerCase();
    const description = String(project?.description || '').toLowerCase();
    const matchesSearch = title.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || String(project?.projectType || '').toLowerCase() === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      'DRAFT': 'bg-slate-100 text-slate-700 border-slate-200',
      'ANALYZING': 'bg-amber-50 text-amber-700 border-amber-200',
      'APPROVED': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'HIGH_RISK': 'bg-rose-50 text-rose-700 border-rose-200'
    };
    const config = statusConfig[status?.toUpperCase()] || statusConfig['DRAFT'];
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${config} shadow-sm uppercase tracking-wide`}>
        {status || 'DRAFT'}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'bridge': return <LayoutTemplate className="w-5 h-5 text-indigo-500" />;
      case 'road': return <Activity className="w-5 h-5 text-indigo-500" />;
      case 'building': return <Building className="w-5 h-5 text-indigo-500" />;
      default: return <BriefcaseBusiness className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Projects Portfolio"
          description="Manage and monitor all your ongoing and planned projects."
        />
        <Link
          to="/projects/new"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 font-medium group"
        >
          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          New Project
        </Link>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-slate-200/60 p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="relative w-full sm:w-auto min-w-50">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10 pointer-events-none" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full pl-11 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer text-slate-700"
          >
            <option value="all">All Types</option>
            <option value="building">Buildings</option>
            <option value="bridge">Bridges</option>
            <option value="road">Roads</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300">
          <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No projects found</h3>
          <p className="text-slate-500">Try adjusting your search criteria or create a new project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div 
              key={project._id || project.id || Math.random()} 
              className="group bg-white rounded-2xl border border-slate-200/75 shadow-sm hover:shadow-xl hover:border-indigo-200/50 transition-all duration-300 overflow-hidden flex flex-col h-full"
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
                    {getTypeIcon(project.projectType)}
                  </div>
                  {getStatusBadge(project.status)}
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">
                  {project.title}
                </h3>
                
                <p className="text-slate-500 text-sm mb-6 line-clamp-2 flex-1">
                  {project.description || "No description provided for this project."}
                </p>

                <div className="space-y-3 mb-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center text-sm text-slate-600">
                    <MapPin className="w-4 h-4 mr-2.5 text-slate-400" />
                    <span className="truncate">{project.location?.address || 'Location not set'}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <DollarSign className="w-4 h-4 mr-2.5 text-emerald-500" />
                    <span>
                      LKR {Number.isFinite(Number(project?.budget)) ? Number(project.budget).toLocaleString() : '0'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="w-4 h-4 mr-2.5 text-indigo-400" />
                    <span>
                      {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'} 
                      {' → '} 
                      {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <Link 
                  to={`/projects/${project._id || project.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-indigo-600 border border-indigo-100 font-medium rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-300"
                >
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectsPage;