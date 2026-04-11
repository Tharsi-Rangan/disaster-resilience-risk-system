import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { 
  ArrowLeft, Edit, Trash2, MapPin, Calendar, 
  DollarSign, Activity, AlertCircle, Clock 
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { projectService } from '../../services/projectService';

const containerStyle = {
  width: '100%',
  height: '100%'
};

function GoogleEmbedMap({ lat, lng }) {
  const embedUrl = `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

  return (
    <iframe
      title="Project location map"
      src={embedUrl}
      className="h-full w-full border-0"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}

function ProjectDetailsMap({ mapsApiKey, project, onMapBlocked }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: mapsApiKey,
  });

  useEffect(() => {
    if (loadError) {
      onMapBlocked?.();
    }
  }, [loadError, onMapBlocked]);

  if (!isLoaded) {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-slate-500">
        <div className="space-y-2">
          <MapPin className="w-8 h-8 mx-auto text-slate-300" />
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={{ lat: project.location.lat, lng: project.location.lng }}
      zoom={14}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
      }}
    >
      <Marker position={{ lat: project.location.lat, lng: project.location.lng }} />
    </GoogleMap>
  );
}

function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapsApiKey, setMapsApiKey] = useState('');
  const [isMapKeyLoading, setIsMapKeyLoading] = useState(true);
  const [isMapBlocked, setIsMapBlocked] = useState(false);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const onAuthFailure = () => {
      setIsMapBlocked(true);
    };

    window.addEventListener('google-maps-auth-failure', onAuthFailure);
    return () => window.removeEventListener('google-maps-auth-failure', onAuthFailure);
  }, []);

  useEffect(() => {
    fetchProject();
  }, [id]);

  useEffect(() => {
    let isCancelled = false;

    const loadMapsKey = async () => {
      try {
        if (!isCancelled) {
          setIsMapKeyLoading(true);
        }
        const response = await projectService.getMapsApiKey();
        const key = String(response?.apiKey || '').trim();

        if (!isCancelled && key) {
          setMapsApiKey((prev) => prev || key);
        }
      } catch (err) {
        // Keep map optional if key fetch fails.
      } finally {
        if (!isCancelled) {
          setIsMapKeyLoading(false);
        }
      }
    };

    loadMapsKey();

    return () => {
      isCancelled = true;
    };
  }, []);

  const fetchProject = async () => {
    try {
      setIsLoading(true);
      const data = await projectService.getProjectById(id);
      setProject(data.project || data);
    } catch (err) {
      setError(err?.message || 'Failed to load project details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      await projectService.deleteProject(id);
      navigate('/projects');
    } catch (err) {
      alert(err?.message || 'Failed to delete project.');
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'DRAFT': 'bg-slate-100 text-slate-700 border-slate-200',
      'ANALYZING': 'bg-amber-50 text-amber-700 border-amber-200',
      'APPROVED': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'HIGH_RISK': 'bg-rose-50 text-rose-700 border-rose-200'
    };
    const config = statusConfig[status?.toUpperCase()] || statusConfig['DRAFT'];
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${config} shadow-sm uppercase tracking-wider`}>
        {status || 'DRAFT'}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-3xl mx-auto mt-12 bg-white rounded-2xl border border-red-100 p-8 text-center shadow-lg shadow-red-500/5">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Project Not Found</h2>
        <p className="text-slate-500 mb-6">{error || "The project you are looking for doesn't exist or has been removed."}</p>
        <Link to="/projects" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/projects"
            className="p-2.5 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-extrabold text-slate-900">{project.title}</h1>
              {getStatusBadge(project.status)}
            </div>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              <span className="capitalize">{project.projectType} Project</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/projects/${id}/edit`}
            className="inline-flex items-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center px-4 py-2.5 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 hover:text-red-700 transition-all disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : <><Trash2 className="w-4 h-4 mr-2" /> Delete</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">About the Project</h3>
            <p className="text-slate-600 leading-relaxed mb-8 whitespace-pre-wrap">
              {project.description || "No description provided."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-start gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-800 mb-1">Total Budget</p>
                  <p className="text-2xl font-bold text-emerald-900">
                    LKR {project.budget?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>

              <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-start gap-4">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-indigo-800 mb-1">Timeline</p>
                  <p className="text-lg font-bold text-indigo-900">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'} 
                    <span className="text-indigo-400 mx-1">→</span> 
                    {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             {/* Quick Actions / Shortcuts to other modules */}
             <Link to={`/projects/${id}/risk-data`} className="p-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-center group">
               <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                 <Activity className="w-6 h-6" />
               </div>
               <h4 className="font-semibold text-slate-800">Risk Data</h4>
               <p className="text-xs text-slate-500 mt-1">View historical data</p>
             </Link>
             <Link to={`/projects/${id}/assessment`} className="p-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-amber-200 transition-all text-center group">
               <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                 <AlertCircle className="w-6 h-6" />
               </div>
               <h4 className="font-semibold text-slate-800">Assessments</h4>
               <p className="text-xs text-slate-500 mt-1">Manage risks</p>
             </Link>
             <Link to={`/projects/${id}/mitigation`} className="p-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-purple-200 transition-all text-center group">
               <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                 <MapPin className="w-6 h-6" />
               </div>
               <h4 className="font-semibold text-slate-800">Mitigation</h4>
               <p className="text-xs text-slate-500 mt-1">Plans & actions</p>
             </Link>
          </div>
        </div>

        {/* Right Column: Map & Location */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
              <MapPin className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-slate-800">Location Details</h3>
            </div>
            
            <div className="flex-1 relative bg-slate-100">
              {!isMapKeyLoading && mapsApiKey && !isMapBlocked && project.location?.lat && project.location?.lng ? (
                <ProjectDetailsMap
                  mapsApiKey={mapsApiKey}
                  project={project}
                  onMapBlocked={() => setIsMapBlocked(true)}
                />
              ) : project.location?.lat && project.location?.lng ? (
                <GoogleEmbedMap lat={project.location.lat} lng={project.location.lng} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-slate-500">
                  <div className="space-y-2">
                    <MapPin className="w-8 h-8 mx-auto text-slate-300" />
                    <p>Map view is unavailable. Address details are still available below.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 bg-white border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Registered Address</label>
              <p className="text-slate-800 font-medium">
                {project.location?.address || "Address not specified"}
              </p>
              
              {project.location?.lat && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-6 text-sm">
                  <div>
                    <span className="block text-xs text-slate-500 mb-0.5">Latitude</span>
                    <span className="font-mono font-medium text-slate-700">{project.location.lat.toFixed(5)}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 mb-0.5">Longitude</span>
                    <span className="font-mono font-medium text-slate-700">{project.location.lng.toFixed(5)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetailsPage;