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
      } catch {
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
        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-3xl mx-auto mt-12 bg-white/90 glass-panel rounded-3xl border border-red-200/80 p-10 text-center shadow-lg shadow-red-500/5">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-red-100">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 heading-font mb-3">Project Record Unavailable</h2>
        <p className="text-slate-500 font-medium mb-8 text-lg">{error || "The project you are looking for doesn't exist or has been removed."}</p>
        <Link to="/projects" className="inline-flex items-center px-6 py-3 dark-pro-gradient text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <ArrowLeft className="w-5 h-5 mr-3" /> Back to Projects View
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
            className="p-3 bg-white rounded-full border border-slate-200/80 hover:bg-slate-50 transition-colors shadow-sm focus:ring-2 focus:ring-slate-500 group"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <div className="flex items-center gap-4 mb-1">
              <h1 className="text-4xl font-black text-slate-900 heading-font tracking-tight">{project.title}</h1>
              {getStatusBadge(project.status)}
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm flex items-center gap-2 mt-2">
              <span className="text-slate-600">{project.projectType} Project Infrastructure</span>
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
          <div className="bg-white/90 glass-panel rounded-3xl border border-slate-200/80 shadow-md p-10">
            <h3 className="text-xl font-extrabold text-slate-900 heading-font border-b border-slate-200/60 pb-5 mb-8">About the Initiative</h3>
            <p className="text-slate-600 leading-relaxed text-lg font-medium mb-10 whitespace-pre-wrap">
              {project.description || "No description provided."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-5 shadow-inner">
                <div className="p-4 bg-white shadow-sm text-emerald-600 rounded-xl border border-slate-100">
                  <DollarSign className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Total Budget</p>
                  <p className="text-3xl font-extrabold text-slate-900 heading-font">
                    LKR {project.budget?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-5 shadow-inner">
                <div className="p-4 bg-white shadow-sm text-slate-700 rounded-xl border border-slate-100">
                  <Clock className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Timeline</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'} 
                    <span className="text-slate-400 mx-2">→</span> 
                    {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
             {/* Quick Actions / Shortcuts to other modules */}
             <Link to={`/projects/${id}/risk-data`} className="p-6 bg-white/90 glass-panel border border-slate-200/80 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-center group">
               <div className="w-14 h-14 bg-slate-50 text-slate-700 shadow-inner rounded-2xl border border-slate-200 flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300">
                 <Activity className="w-6 h-6" />
               </div>
               <h4 className="font-extrabold text-slate-900 heading-font text-lg">Risk Data</h4>
               <p className="text-xs font-medium text-slate-500 mt-1">View historical data</p>
             </Link>
             <Link to={`/projects/${id}/assessment`} className="p-6 bg-white/90 glass-panel border border-slate-200/80 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-center group">
               <div className="w-14 h-14 bg-slate-50 text-slate-700 shadow-inner rounded-2xl border border-slate-200 flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300">
                 <AlertCircle className="w-6 h-6" />
               </div>
               <h4 className="font-extrabold text-slate-900 heading-font text-lg">Assessments</h4>
               <p className="text-xs font-medium text-slate-500 mt-1">Manage risks</p>
             </Link>
             <Link to={`/projects/${id}/mitigation`} className="p-6 bg-white/90 glass-panel border border-slate-200/80 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-center group">
               <div className="w-14 h-14 bg-slate-50 text-slate-700 shadow-inner rounded-2xl border border-slate-200 flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300">
                 <MapPin className="w-6 h-6" />
               </div>
               <h4 className="font-extrabold text-slate-900 heading-font text-lg">Mitigation</h4>
               <p className="text-xs font-medium text-slate-500 mt-1">Plans & actions</p>
             </Link>
          </div>
        </div>

        {/* Right Column: Map & Location */}
        <div className="space-y-6">
          <div className="bg-white/90 glass-panel rounded-3xl border border-slate-200/80 shadow-md overflow-hidden flex flex-col h-[500px]">
            <div className="p-5 border-b border-slate-200/60 flex items-center justify-between bg-white relative z-10 shadow-sm">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-100 rounded-xl"><MapPin className="w-5 h-5 text-slate-600" /></div>
                 <h3 className="font-extrabold text-slate-900 heading-font text-lg tracking-tight">Geographic Data</h3>
              </div>
            </div>
            
            <div className="flex-1 relative bg-slate-100 group/map">
              <div className="absolute inset-x-0 top-0 h-1 bg-slate-900 z-10 opacity-0 group-hover/map:opacity-100 transition-opacity"></div>
              {!isMapKeyLoading && mapsApiKey && !isMapBlocked && project.location?.lat && project.location?.lng ? (
                <ProjectDetailsMap
                  mapsApiKey={mapsApiKey}
                  project={project}
                  onMapBlocked={() => setIsMapBlocked(true)}
                />
              ) : project.location?.lat && project.location?.lng ? (
                <div className="w-full h-full grayscale-[30%] group-hover/map:grayscale-0 transition-all duration-700">
                  <GoogleEmbedMap lat={project.location.lat} lng={project.location.lng} />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-slate-500 bg-slate-50">
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-slate-200">
                      <MapPin className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="font-medium max-w-xs mx-auto">Map view unavailable. Address data available below.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-white border-t border-slate-200/60 relative z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Registered Address Location</label>
              <p className="text-slate-800 font-bold text-sm">
                {project.location?.address || "Address not provided"}
              </p>
              
              {project.location?.lat && (
                <div className="mt-5 pt-5 border-t border-slate-100 flex gap-8 text-sm">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Latitude</span>
                    <span className="font-mono font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-md">{project.location.lat.toFixed(5)}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Longitude</span>
                    <span className="font-mono font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-md">{project.location.lng.toFixed(5)}</span>
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
