'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Calendar, Phone, User } from 'lucide-react';

const TouristInfoForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    touristType: initialData.touristType || '',
    visitPurpose: initialData.visitPurpose || '',
    stayDuration: initialData.stayDuration || '',
    emergencyContact: initialData.emergencyContact || '',
    accommodationAddress: initialData.accommodationAddress || '',
    arrivalDate: initialData.arrivalDate || '',
    departureDate: initialData.departureDate || '',
    ...initialData
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tourist Information</CardTitle>
        <CardDescription>
          Provide your travel and accommodation details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tourist Type</label>
              <select
                name="touristType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.touristType}
                onChange={handleChange}
                required
              >
                <option value="">Select type</option>
                <option value="leisure">Leisure Tourist</option>
                <option value="business">Business Traveler</option>
                <option value="education">Educational Visit</option>
                <option value="medical">Medical Tourism</option>
                <option value="transit">Transit Passenger</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Visit Purpose</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  name="visitPurpose"
                  type="text"
                  placeholder="Purpose of visit"
                  value={formData.visitPurpose}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Arrival Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  name="arrivalDate"
                  type="date"
                  value={formData.arrivalDate}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Departure Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  name="departureDate"
                  type="date"
                  value={formData.departureDate}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Stay Duration</label>
              <Input
                name="stayDuration"
                type="text"
                placeholder="e.g., 7 days"
                value={formData.stayDuration}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Emergency Contact</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  name="emergencyContact"
                  type="text"
                  placeholder="Emergency contact info"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Accommodation Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                name="accommodationAddress"
                type="text"
                placeholder="Hotel or accommodation address"
                value={formData.accommodationAddress}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Save Tourist Information'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TouristInfoForm;