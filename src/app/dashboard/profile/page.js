// app/dashboard/profile/page.js
'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import DashboardNav from '@/components/dashboard/DashboardNav';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { User, MapPin, Phone, Calendar, Flag, Mail } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchUserData = async () => {
      if (!user) {
        if (mounted) {
          setUserData(null);
          setLoading(false);
        }
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && mounted) {
          setUserData(userDoc.data());
        } else if (mounted) {
          setUserData(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (mounted) setUserData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUserData();

    return () => {
      mounted = false;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-medium">You are not signed in</p>
          <p className="text-muted-foreground mt-2">
            Please sign in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav activeTab="profile" onTabChange={() => {}} userEmail={user?.email} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your registered account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Full Name</p>
                      <p className="text-muted-foreground">
                        {userData?.fullName || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">{userData?.email || user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-muted-foreground">{userData?.phone || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-muted-foreground">{userData?.address || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Date of Birth</p>
                      <p className="text-muted-foreground">{userData?.dateOfBirth || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Flag className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Nationality</p>
                      <p className="text-muted-foreground">{userData?.nationality || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {userData?.touristInfo && (
              <Card>
                <CardHeader>
                  <CardTitle>Tourist Information</CardTitle>
                  <CardDescription>Your travel and accommodation details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Tourist Type</p>
                      <p className="text-muted-foreground">
                        {userData.touristInfo.touristType || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Visit Purpose</p>
                      <p className="text-muted-foreground">
                        {userData.touristInfo.visitPurpose || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Stay Duration</p>
                      <p className="text-muted-foreground">
                        {userData.touristInfo.stayDuration || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Emergency Contact</p>
                      <p className="text-muted-foreground">
                        {userData.touristInfo.emergencyContact || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
