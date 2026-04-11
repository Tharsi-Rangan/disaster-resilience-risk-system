import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Save, ArrowLeft, MapPin, AlertCircle, Map as MapIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { projectService } from '../../services/projectService';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 6.9271, // Colombo default
  lng: 79.8612
};

function GoogleEmbedMap({ lat, lng }) {
  const embedUrl = `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

  return (
    <iframe
      title="Selected location map"
      src={embedUrl}
      className="h-full w-full border-0"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}

function ProjectMap({ mapsApiKey, formData, onMapLoad, onMapUnmount, onMapClick, onMapBlocked }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: mapsApiKey,
  });

  useEffect(() => {
    if (loadError) {
      onMapBlocked?.();
    }
  }, [loadError, onMapBlocked]);

  if (loadError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-slate-500">
        Map cannot be loaded right now. Please verify the same key has Maps JavaScript API enabled and billing active.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={formData.location.lat ? { lat: formData.location.lat, lng: formData.location.lng } : defaultCenter}
      zoom={12}
      onLoad={onMapLoad}
      onUnmount={onMapUnmount}
      onClick={onMapClick}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
      }}
    >
      {formData.location.lat && formData.location.lng && (
        <Marker position={{ lat: formData.location.lat, lng: formData.location.lng }} />
      )}
    </GoogleMap>
  );
}

function ProjectCreatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [error, setError] = useState('');
  const [mapsApiKey, setMapsApiKey] = useState('');
  const [isMapKeyLoading, setIsMapKeyLoading] = useState(true);
  const [isMapBlocked, setIsMapBlocked] = useState(false);
  
  // Initialize form state matching backend structure
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectType: 'building',
    budget: '',
    startDate: '',
    endDate: '',
    location: {
      address: '',
      lat: null,
      lng: null
    }
  });

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

        if (!isCancelled && !key) {
          setError('Google Maps key is missing in backend configuration.');
        }
      } catch (err) {
        if (!isCancelled) {
          setError('Unable to load Google Maps configuration.');
        }
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

  useEffect(() => {
    const onAuthFailure = () => {
      setIsMapBlocked(true);
      setError('Google Maps is blocked for this API key. Continue by entering address manually.');
    };

    window.addEventListener('google-maps-auth-failure', onAuthFailure);
    return () => window.removeEventListener('google-maps-auth-failure', onAuthFailure);
  }, []);

  const mapRef = useRef(null);
  
  const onMapLoad = useCallback(function callback(map) {
    mapRef.current = map;
  }, []);

  const onMapUnmount = useCallback(function callback(map) {
    mapRef.current = null;
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationAddressChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        address: value,
      },
    }));
  };

  const geocodeAddressFromInput = async () => {
    const address = String(formData.location.address || '').trim();

    if (!address) {
      setError('Please enter an address first.');
      return;
    }

    if (!window.google?.maps?.Geocoder) {
      setError('Map is still loading. You can still submit with the typed address.');
      return;
    }

    try {
      setIsGeocodingAddress(true);
      setError('');

      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ address });

      if (response.results?.[0]) {
        const { lat, lng } = response.results[0].geometry.location;
        setFormData((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            address: response.results[0].formatted_address,
            lat: lat(),
            lng: lng(),
          },
        }));
        return;
      }

      setError('Address not found. Please refine the text or pin on map.');
    } catch (err) {
      setError('Unable to resolve this address now. You can still submit with the typed address.');
    } finally {
      setIsGeocodingAddress(false);
    }
  };

  const getAddressFromLatLng = async (lat, lng) => {
    try {
      if (!window.google) return;
      
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      
      if (response.results[0]) {
        const address = response.results[0].formatted_address;
        setFormData(prev => ({
          ...prev,
          location: { ...prev.location, address, lat, lng }
        }));
      } else {
        // Fallback if no address found
        setFormData(prev => ({
          ...prev,
          location: { ...prev.location, lat, lng }
        }));
      }
    } catch (err) {
      console.error('Geocode error:', err);
      // Still save the coordinates even if geocoding fails
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, lat, lng }
      }));
    }
  };

  const onMapClick = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    getAddressFromLatLng(lat, lng);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (!formData.title || !formData.budget || !formData.startDate || !formData.endDate) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!String(formData.location.address || '').trim()) {
      setError('Please enter a location address or pin a point on the map.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        ...formData,
        budget: Number(formData.budget),
        location: {
          ...formData.location,
          address: String(formData.location.address || '').trim(),
        },
        status: 'DRAFT'
      };

      const response = await projectService.createProject(payload);
      
      // If successful layout, redirect
      navigate('/projects');
    } catch (err) {
      setError(err?.message || 'Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4">
        <Link
          to="/projects"
          className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <PageHeader
          title="Create New Project"
          description="Enter comprehensive project details and set the precise location."
        />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/90 glass-panel rounded-3xl border border-slate-200/80 shadow-md p-8 space-y-8">
            <h3 className="text-xl font-extrabold text-slate-900 heading-font border-b border-slate-200/60 pb-5">General Information</h3>
            
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Project Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:bg-white transition-all text-slate-900"
                  placeholder="e.g. Marine Drive Extension"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:bg-white transition-all text-slate-900"
                  placeholder="Provide brief details about this project..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Project Type</label>
                  <select
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:bg-white transition-all text-slate-900 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010l5%205%205-5H7z%22%20fill%3D%22%2394a3b8%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:calc(100%-0.5rem)_center]"
                  >
                    <option value="building">Building</option>
                    <option value="bridge">Bridge</option>
                    <option value="road">Road</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Budget (LKR) *</label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:bg-white transition-all text-slate-900"
                    placeholder="e.g. 50000000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:bg-white transition-all text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Completion Date *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:bg-white transition-all text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Location / Map */}
        <div className="space-y-6">
          <div className="bg-white/90 glass-panel rounded-3xl border border-slate-200/80 shadow-md overflow-hidden flex flex-col h-[520px]">
            <div className="p-5 border-b border-slate-200/60 flex items-center gap-3 bg-gradient-to-r from-slate-50 to-white">
              <div className="p-2 bg-slate-100/50 rounded-lg">
                <MapIcon className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="font-bold text-slate-900 heading-font text-lg tracking-tight">Pin Location</h3>
            </div>

            <div className="p-4 border-b border-slate-100 bg-white space-y-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Location Address
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={handleLocationAddressChange}
                  placeholder="Type an address or click on map"
                  className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
                <button
                  type="button"
                  onClick={geocodeAddressFromInput}
                  disabled={isGeocodingAddress || !String(formData.location.address || '').trim()}
                  className="px-3 py-2 text-sm font-medium text-white bg-slate-600 rounded-lg hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {isGeocodingAddress ? 'Locating...' : 'Locate'}
                </button>
              </div>
            </div>
            
            <div className="flex-1 relative bg-slate-100">
              {isMapKeyLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
                </div>
              )}
              {!isMapKeyLoading && !mapsApiKey && (
                <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-slate-500">
                  Google Maps key is not available from backend configuration.
                </div>
              )}
              {!isMapKeyLoading && !!mapsApiKey && !isMapBlocked && (
                <ProjectMap
                  mapsApiKey={mapsApiKey}
                  formData={formData}
                  onMapLoad={onMapLoad}
                  onMapUnmount={onMapUnmount}
                  onMapClick={onMapClick}
                  onMapBlocked={() => setIsMapBlocked(true)}
                />
              )}
              {!isMapKeyLoading && (!!mapsApiKey && isMapBlocked) && (
                formData.location?.lat && formData.location?.lng ? (
                  <GoogleEmbedMap lat={formData.location.lat} lng={formData.location.lng} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-slate-500">
                    Google Maps is blocked for this key. Use the address input above to continue.
                  </div>
                )
              )}
            </div>

            <div className="p-4 bg-white border-t border-slate-100 space-y-3">
              <div className="flex gap-3 items-start">
                <MapPin className="w-5 h-5 text-red-500 mt-1 shrink-0" />
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Selected Address</label>
                  <p className="text-sm text-slate-800 font-medium line-clamp-2">
                    {formData.location.address || "Click on the map to pin a location"}
                  </p>
                </div>
              </div>

              {formData.location.lat && (
                <div className="flex gap-4 text-xs font-mono text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span>Lat: {formData.location.lat.toFixed(4)}</span>
                  <span>Lng: {formData.location.lng.toFixed(4)}</span>
                </div>
              )}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center py-4 px-6 dark-pro-gradient text-white font-bold tracking-wide rounded-2xl shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/40 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></span>
            ) : (
              <Save className="w-5 h-5 mr-3" />
            )}
            Initialize Project
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProjectCreatePage;
