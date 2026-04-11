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
      case 'bridge': return <LayoutTemplate className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />;
      case 'road': return <Activity className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />;
      case 'building': return <Building className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />;
      default: return <BriefcaseBusiness className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />;
    }
  };

  const quickFilters = [
    { id: 'all', label: 'All Projects', value: 'all' },
    { id: 'building', label: 'Buildings', value: 'building' },
    { id: 'bridge', label: 'Bridges', value: 'bridge' },
    { id: 'road', label: 'Roads', value: 'road' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Projects Portfolio"
          description="Manage and monitor all your ongoing and planned projects."
        />
        <Link
          to="/projects/new"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-slate-600 text-white rounded-xl hover:bg-slate-700 hover:shadow-lg hover:shadow-slate-500/30 transition-all duration-300 font-medium group"
        >
          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          New Project
        </Link>
      </div>

      <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row gap-5 items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
             {quickFilters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setFilterType(filter.value)}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                    filterType === filter.value
                      ? 'bg-slate-600 text-white shadow-md shadow-slate-600/20 block'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                  }`}
                >
                  {filter.label}
                </button>
             ))}
          </div>

          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-600 focus:bg-white transition-all text-sm font-medium text-slate-800 shadow-inner"
            />
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
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No projects found</h3>
          <p className="text-slate-500">Try adjusting your search criteria or create a new project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div 
              key={project._id || project.id || Math.random()} 
              className="group bg-white rounded-2xl border border-slate-200/75 shadow-sm hover:shadow-xl hover:border-slate-200/50 transition-all duration-300 overflow-hidden flex flex-col h-full"
            >
              <div className="p-7 flex-1 flex flex-col relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-slate-600 transition-all duration-300 shadow-sm border border-slate-200 group-hover:border-slate-500 group-hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                    {getTypeIcon(project.projectType)}
                  </div>
                  {getStatusBadge(project.status)}
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-3 line-clamp-1 heading-font group-hover:text-slate-700 transition-colors">
                  {project.title}
                </h3>
                
                <p className="text-slate-500 text-sm mb-6 line-clamp-3 flex-1 font-medium leading-relaxed">
                  {project.description || "No description provided for this project."}
                </p>

                <div className="space-y-4 mb-2 bg-slate-50 rounded-xl border border-slate-100 p-5 group-hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center text-sm font-semibold text-slate-700">
                    <MapPin className="w-4 h-4 mr-3 text-slate-500" />
                    <span className="truncate">{project.location?.address || 'Location not set'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-3 text-emerald-500" />
                      <span>LKR {Number.isFinite(Number(project?.budget)) ? Number(project.budget).toLocaleString() : '0'}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest border-t border-slate-200/60 pt-3 mt-3">
                    <Calendar className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    <span>
                      {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'} 
                      {' → '} 
                      {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-white relative z-10">
                <Link 
                  to={`/projects/${project._id || project.id}`}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-600 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-slate-600/20 group/btn"
                >
                  View Full Details
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
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
