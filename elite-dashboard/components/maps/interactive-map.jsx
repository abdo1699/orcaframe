'use client';

import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export function InteractiveMap({ data = [] }) {
  // Egypt center coordinates
  const egyptCenter = [26.8206, 30.8025];
  
  // Group data by city
  const cityData = data.reduce((acc, item) => {
    const city = item.city?.toLowerCase();
    if (!city) return acc;
    
    if (!acc[city]) {
      acc[city] = {
        name: item.city,
        latitude: item.latitude || 0,
        longitude: item.longitude || 0,
        projects: [],
        totalValue: 0,
        count: 0
      };
    }
    
    acc[city].projects.push(item);
    acc[city].totalValue += Number(item.price) || 0;
    acc[city].count += 1;
    
    return acc;
  }, {});

  // Get bubble color based on average price
  const getBubbleColor = (avgPrice) => {
    if (avgPrice > 20000000) return '#3B82F6'; // Blue
    if (avgPrice > 10000000) return '#10B981'; // Green
    return '#F59E0B'; // Yellow
  };

  // Get bubble size based on total value
  const getBubbleSize = (totalValue) => {
    return Math.max(8, Math.min(25, 8 + Math.sqrt(totalValue) / 200));
  };

  return (
    <div className="w-full h-80 rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={egyptCenter}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {Object.values(cityData).map((city, index) => {
          if (!city.latitude || !city.longitude) return null;
          
          const avgPrice = city.totalValue / city.count;
          const bubbleColor = getBubbleColor(avgPrice);
          const bubbleSize = getBubbleSize(city.totalValue);
          
          return (
            <CircleMarker
              key={index}
              center={[city.latitude, city.longitude]}
              radius={bubbleSize}
              pathOptions={{
                fillColor: bubbleColor,
                color: '#ffffff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-gray-900 mb-2">{city.name}</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Projects:</span>
                      <span className="font-medium">{city.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Value:</span>
                      <span className="font-medium">${(city.totalValue / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Price:</span>
                      <span className="font-medium">${(avgPrice / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      <div className="text-xs text-gray-500">
                        Status: {city.projects.filter(p => p.status === 'finished').length} finished, {' '}
                        {city.projects.filter(p => p.status === 'in progress').length} in progress, {' '}
                        {city.projects.filter(p => p.status === 'delayed').length} delayed
                      </div>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
