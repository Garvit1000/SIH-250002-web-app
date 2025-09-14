'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import TouristInfoForm from '@/components/tourist/TouristInfoForm';
import DashboardNav from '@/components/dashboard/DashboardNav';

export default function CapturePage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTouristInfoSubmit = async (formData) => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        touristInfo: formData,
        touristInfoCaptured: true,
        touristInfoCapturedAt: new Date().toISOString()
      });
      fetchUserData();
    } catch (error) {
      console.error('Error saving tourist info:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav 
        activeTab="capture"
        onTabChange={() => {}}
        userEmail={user?.email}
      />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <TouristInfoForm 
            onSubmit={handleTouristInfoSubmit}
            initialData={userData?.touristInfo || {}}
          />
        </div>
      </main>
    </div>
  );
}
