"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from 'next/image';

const propertyTypes = [
  { value: "villa", label: "Villa" },
  { value: "apartment", label: "Apartment" },
  { value: "duplex", label: "Duplex" },
  { value: "penthouse", label: "Penthouse" },
  { value: "townhouse", label: "Townhouse" },
];

const statusOptions = [
  { value: "in progress", label: "In Progress" },
  { value: "finished", label: "Finished" },
];

function AddDataContent() {
  const router = useRouter();
  
  // Check authentication status on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole');
      
      // If no role found, redirect to login
      if (!role) {
        window.location.href = '/';
        return;
      }
      
      // If not admin, redirect to dashboard
      if (role !== 'admin') {
        window.location.href = '/dashboard';
        return;
      }
    }
  }, []);
  
  const [form, setForm] = useState({
    propertyType: "",
    size: "",
    price: "",
    city: "",
    latitude: "",
    floors: "",
    status: "",
    parking_spaces: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (name, value) => {
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate all fields are filled
    const requiredFields = [
      'propertyType',
      'size',
      'price',
      'city',
      'floors',
      'status',
      'parking_spaces',
    ];

    for (const key of requiredFields) {
      const value = String(form[key] ?? '').trim();
      if (!value) {
        toast.error('Please fill all the fields before adding a property.');
        // Try to focus the first invalid field
        const el = document.getElementById(key);
        if (el && typeof el.focus === 'function') el.focus();
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          ts: Date.now(),
        }),
      });

      if (response.ok) {
        toast.success('Property added successfully!');
        router.push('/dashboard');
      } else {
        throw new Error('Failed to save property');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to add property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header with Logo and Actions */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="relative h-10 w-32">
              <Image
                src="/orcaframe-logo.png"
                alt="OrcaFrame Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Property</h1>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type</Label>
                  <select
                    id="propertyType"
                    name="propertyType"
                    value={form.propertyType}
                    onChange={(e) => handleSelectChange('propertyType', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="">Select property type</option>
                    {propertyTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="size">Size (sqm)</Label>
                  <Input
                    id="size"
                    name="size"
                    type="number"
                    value={form.size}
                    onChange={handleChange}
                    placeholder="Enter size in square meters"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Enter price in USD"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="floors">Number of Floors</Label>
                  <Input
                    id="floors"
                    name="floors"
                    type="number"
                    value={form.floors}
                    onChange={handleChange}
                    placeholder="Enter number of floors"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="parking_spaces">Parking Spaces</Label>
                  <Input
                    id="parking_spaces"
                    name="parking_spaces"
                    type="number"
                    value={form.parking_spaces}
                    onChange={handleChange}
                    placeholder="Enter number of parking spaces"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <div id="status" className="flex items-center gap-6">
                    {statusOptions.map((status) => (
                      <label key={status.value} className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="status"
                          value={status.value}
                          checked={form.status === status.value}
                          onChange={(e) => handleSelectChange('status', e.target.value)}
                          required
                        />
                        {status.label}
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude (Optional)</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={handleChange}
                    placeholder="Enter latitude"
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end gap-4 border-t p-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Property'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function AddDataPage() {
  // This component is now a simple wrapper that renders the content
  // Authentication is handled inside AddDataContent
  return <AddDataContent />;
}
