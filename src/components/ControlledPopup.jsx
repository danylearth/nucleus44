import { Popup } from 'react-leaflet';
import { useEffect, useRef } from 'react';

const ControlledPopup = ({ children, position, isOpen, onOpen, onClose, ...props }) => {
  const popupRef = useRef();

  useEffect(() => {
    if (popupRef.current) {
      if (isOpen) {
        popupRef.current.openOn(popupRef.current._map);
      } else {
        popupRef.current.close();
      }
    }
  }, [isOpen]);

  return (
    <Popup
      ref={popupRef}
      position={position}
      eventHandlers={{
        add: (e) => {
          if (onOpen) onOpen(e);
        },
        remove: (e) => {
          if (onClose) onClose(e);
        }
      }}
      {...props}
    >
      {children}
    </Popup>
  );
};

export default ControlledPopup;