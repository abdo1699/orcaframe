'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search, X } from 'lucide-react';

export function AdvancedFilter({ 
  cities = [], 
  propertyTypes = [], 
  selectedCities = [], 
  selectedTypes = [], 
  onCitiesChange, 
  onTypesChange 
}) {
  const [isCitiesOpen, setIsCitiesOpen] = useState(false);
  const [isTypesOpen, setIsTypesOpen] = useState(false);
  const [citiesSearch, setCitiesSearch] = useState('');
  const [typesSearch, setTypesSearch] = useState('');
  const citiesRef = useRef(null);
  const typesRef = useRef(null);

  // Filter cities and types based on search
  const filteredCities = cities.filter(city => 
    city.toLowerCase().includes(citiesSearch.toLowerCase())
  );
  const filteredTypes = propertyTypes.filter(type => 
    type.toLowerCase().includes(typesSearch.toLowerCase())
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (citiesRef.current && !citiesRef.current.contains(event.target)) {
        setIsCitiesOpen(false);
      }
      if (typesRef.current && !typesRef.current.contains(event.target)) {
        setIsTypesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCityToggle = (city) => {
    const newCities = selectedCities.includes(city)
      ? selectedCities.filter(c => c !== city)
      : [...selectedCities, city];
    onCitiesChange(newCities);
  };

  const handleTypeToggle = (type) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    onTypesChange(newTypes);
  };

  const clearCities = () => {
    onCitiesChange([]);
    setCitiesSearch('');
  };

  const clearTypes = () => {
    onTypesChange([]);
    setTypesSearch('');
  };

  return (
    <Card className="p-4 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cities Filter */}
        <div className="relative" ref={citiesRef}>
          <Label className="block text-sm font-medium text-gray-700 mb-2">Cities</Label>
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between text-left"
              onClick={() => setIsCitiesOpen(!isCitiesOpen)}
            >
              <span>
                {selectedCities.length === 0 
                  ? 'All Cities' 
                  : `${selectedCities.length} selected`
                }
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
            
            {isCitiesOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search cities..."
                      value={citiesSearch}
                      onChange={(e) => setCitiesSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  {selectedCities.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearCities}
                      className="mt-2 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear all
                    </Button>
                  )}
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredCities.map((city) => (
                    <label
                      key={city}
                      className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCities.includes(city)}
                        onChange={() => handleCityToggle(city)}
                        className="mr-2"
                      />
                      <span className="text-sm">{city}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Property Types Filter */}
        <div className="relative" ref={typesRef}>
          <Label className="block text-sm font-medium text-gray-700 mb-2">Property Types</Label>
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between text-left"
              onClick={() => setIsTypesOpen(!isTypesOpen)}
            >
              <span>
                {selectedTypes.length === 0 
                  ? 'All Types' 
                  : `${selectedTypes.length} selected`
                }
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
            
            {isTypesOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search types..."
                      value={typesSearch}
                      onChange={(e) => setTypesSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  {selectedTypes.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearTypes}
                      className="mt-2 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear all
                    </Button>
                  )}
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredTypes.map((type) => (
                    <label
                      key={type}
                      className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={() => handleTypeToggle(type)}
                        className="mr-2"
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
