'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef } from 'react';

// Fix for default Leaflet icons not appearing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom marker icon based on value
const createCustomIcon = (value, avgPrice) => {
  let markerColor = 'bg-gray-500'; // Default
  let borderColor = 'border-gray-600';

  if (avgPrice > 20000000) {
    markerColor = 'bg-blue-500';
    borderColor = 'border-blue-600';
  } else if (avgPrice > 10000000) {
    markerColor = 'bg-green-500';
    borderColor = 'border-green-600';
  } else {
    markerColor = 'bg-yellow-500';
    borderColor = 'border-yellow-600';
  }

  const size = Math.max(15, Math.min(40, 15 + Math.sqrt(value) / 100)); // Adjust size for Leaflet

  return L.divIcon({
    className: `custom-div-icon ${markerColor} ${borderColor} rounded-full border-2 shadow-lg flex items-center justify-center text-white font-bold text-xs`,
    html: `<div style="width: ${size}px; height: ${size}px; line-height: ${size}px; text-align: center;">${value}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

export function InteractiveMap({ data }) {
  const mapRef = useRef(null);
  // Group data by city to show aggregated markers
  const groupedData = data.reduce((acc, item) => {
    const city = item.city.toLowerCase();
    if (!acc[city]) {
      acc[city] = {
        city: item.city,
        latitude: item.latitude,
        longitude: item.longitude,
        totalProjects: 0,
        totalValue: 0,
        onTrack: 0,
        delayed: 0,
        completed: 0,
      };
    }
    acc[city].totalProjects += 1;
    acc[city].totalValue += Number(item.price) || 0;
    if (item.status === 'in progress') acc[city].onTrack += 1;
    else if (item.status === 'delayed') acc[city].delayed += 1;
    else if (item.status === 'finished') acc[city].completed += 1;
    return acc;
  }, {});

  const mapMarkers = Object.values(groupedData).filter(
    (city) => city.latitude && city.longitude
  );

  // Calculate bounds to fit all markers
  useEffect(() => {
    if (mapRef.current && mapMarkers.length > 0) {
      const bounds = L.latLngBounds(
        mapMarkers.map((marker) => [marker.latitude, marker.longitude])
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [mapMarkers]);

  return (
    <div className="w-full h-80 rounded-lg overflow-hidden border border-gray-200 z-0">
      <MapContainer
        center={[26.8206, 30.8025]} // Center of Egypt
        zoom={6}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mapMarkers.map((city, index) => {
          const avgPrice = city.totalProjects > 0 ? city.totalValue / city.totalProjects : 0;
          return (
            <Marker
              key={index}
              position={[city.latitude, city.longitude]}
              icon={createCustomIcon(city.totalProjects, avgPrice)}
            >
              <Popup>
                <div className="font-semibold">{city.city}</div>
                <div>Projects: {city.totalProjects}</div>
                <div>Total Value: ${city.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                <div>Avg Price: ${avgPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                <div className="mt-2 text-xs">
                  On Track: {city.onTrack} <br />
                  Delayed: {city.delayed} <br />
                  Completed: {city.completed}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
