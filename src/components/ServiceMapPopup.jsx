import { MapPin, Phone, Clock, Navigation } from 'lucide-react';
import './ServiceMapPopup.css';

const ServiceMapPopup = ({ service }) => {
  const getWaitTimeClass = (waitTime) => {
    if (!waitTime) return 'wait-medium';
    if (waitTime.includes('2 weeks') || waitTime.includes('days')) return 'wait-short';
    if (waitTime.includes('4 weeks') || waitTime.includes('3 weeks')) return 'wait-medium';
    return 'wait-long';
  };

  const getDirectionsUrl = () => {
    const { lat, lng } = service.location;
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  };

  return (
    <div className="service-map-popup">
      <div className="service-popup-header">
        <span className="service-category">{service.category}</span>
        <h3>{service.title}</h3>
      </div>
      
      <div className="service-popup-body">
        <div className="service-popup-info">
          <div className="service-popup-info-item">
            <MapPin size={16} />
            <span>
              {service.location.address}, {service.location.city}, {service.location.postcode}
            </span>
          </div>
          
          {service.phone && (
            <div className="service-popup-info-item">
              <Phone size={16} />
              <span>{service.phone}</span>
            </div>
          )}
          
          {service.waitTime && (
            <div className={`service-popup-wait ${getWaitTimeClass(service.waitTime)}`}>
              <Clock size={14} />
              <span>Wait: {service.waitTime}</span>
            </div>
          )}
        </div>
        
        <div className="service-popup-actions">
          <a 
            href={`/services/${service.slug}`}
            className="service-popup-btn primary"
          >
            View Details
          </a>
          <a 
            href={getDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="service-popup-btn secondary"
          >
            <Navigation size={14} style={{ display: 'inline', marginRight: '4px' }} />
            Directions
          </a>
        </div>
      </div>
    </div>
  );
};

export default ServiceMapPopup;