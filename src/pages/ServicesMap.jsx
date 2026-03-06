import { useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Download, MapPin } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { allServices, serviceCategories } from "../data/services";
import useServicesMap from "../hooks/useServicesMap";
import "leaflet/dist/leaflet.css";

export default function ServicesMap() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const mapRef = useRef(null);
  const { userLocation, mapCenter, closestService, findingLocation, locationError, handleLocateMe } = useServicesMap(allServices);
  
  const toggleCategory = (cat) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };
  
  const filteredServices = selectedCategories.length > 0 
    ? allServices.filter(s => selectedCategories.includes(s.category)) 
    : allServices;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-24 pb-8 bg-gradient-to-br from-[#4099E2] to-[#2D7BC4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-2">Healthcare Services Map</h1>
          <p className="text-xl text-white/90">Find healthcare services near you</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Your Location</h2>
              {locationError && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{locationError}</div>}
              <button onClick={handleLocateMe} disabled={findingLocation} className={findingLocation ? "w-full py-3 rounded-xl font-semibold text-white bg-gray-400" : "w-full py-3 rounded-xl font-semibold text-white bg-[#4099E2] hover:bg-[#2D7BC4]"}>{findingLocation ? "Finding..." : "Locate Me"}</button>
              {closestService && (
                <div className="mt-4 p-4 bg-green-50 rounded-xl">
                  <p className="text-sm text-green-700">Closest: {closestService.title}</p>
                  <p className="text-sm text-green-700">{closestService.distance} km away</p>
                </div>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Filter by Category</h2>
              <div className="space-y-2">
                {serviceCategories.map(cat => (
                  <label key={cat} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} className="w-5 h-5 rounded" />
                    <span className="text-gray-700">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
            <button className="w-full py-3 px-4 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:border-[#4099E2] hover:text-[#4099E2] flex items-center justify-center gap-2">
              <Download size={18} /> Download CSV
            </button>
            <div className="bg-white rounded-xl shadow-sm p-6 max-h-96 overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">Services ({filteredServices.length})</h2>
              <div className="space-y-3">
                {filteredServices.map(service => (
                  <div key={service.id} className="p-4 border border-gray-200 rounded-lg hover:border-[#4099E2] cursor-pointer transition-colors">
                    <h3 className="font-medium text-gray-900">{service.title}</h3>
                    <p className="text-sm text-gray-500">{service.category}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin size={14} /> {service.location.city}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-4 h-[600px]">
              <MapContainer center={mapCenter} zoom={10} className="h-full w-full rounded-lg">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {filteredServices.map(service => (
                  <Marker key={service.id} position={[service.location.lat, service.location.lng]}>
                    <Popup>{service.title}</Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}