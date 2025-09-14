'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import DashboardNav from '@/components/dashboard/DashboardNav';
import ActionCard from '@/components/dashboard/ActionCard';
import StatsCard from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Grid3x3, 
  Shield, 
  FileText, 
  Camera, 
  Download, 
  CheckCircle,
  User,
  MapPin,
  Phone,
  Calendar,
  Flag,
  Anchor
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState(null);

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
    }
  };

  const handleCreateDID = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        didCreated: true,
        didCreatedAt: new Date().toISOString()
      });
      fetchUserData();
    } catch (error) {
      console.error('Error creating DID:', error);
    }
  };

  const handleIssueVC = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        vcIssued: true,
        vcIssuedAt: new Date().toISOString()
      });
      fetchUserData();
    } catch (error) {
      console.error('Error issuing VC:', error);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Registration"
          value="Complete"
          icon={CheckCircle}
          description="Account created successfully"
          color="success"
        />
        <StatsCard
          title="DID Status"
          value={userData?.didCreated ? "Created" : "Pending"}
          icon={Shield}
          description={userData?.didCreated ? "DID ready to use" : "Create your DID"}
          color={userData?.didCreated ? "success" : "warning"}
        />
        <StatsCard
          title="VC Status"
          value={userData?.vcIssued ? "Issued" : "Pending"}
          icon={FileText}
          description={userData?.vcIssued ? "Credentials ready" : "Issue your VC"}
          color={userData?.vcIssued ? "success" : "warning"}
        />
        <StatsCard
          title="Documents"
          value="Ready"
          icon={Download}
          description="Generate your documents"
          color="primary"
        />
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ActionCard
          title="Generate Grid"
          description="Create your identity grid system"
          icon={Grid3x3}
          buttonText="Generate Grid"
          onAction={() => console.log('Generate Grid')}
          completed={userData?.didCreated}
        />
        
        <ActionCard
          title="Create DID / Issue VC"
          description="Generate your decentralized identity and verifiable credentials"
          icon={Shield}
          buttonText="Create DID & VC"
          onAction={handleCreateDID}
          disabled={!userData?.didCreated}
          completed={userData?.didCreated && userData?.vcIssued}
        />
        
        <ActionCard
          title="Non-Custodial Issuance"
          description="Issue credentials without third-party custody"
          icon={FileText}
          buttonText="Issue Credentials"
          onAction={handleIssueVC}
          disabled={!userData?.didCreated}
          completed={userData?.vcIssued}
        />
        
        <ActionCard
          title="Capture Tourist Information"
          description="Record your travel and tourist details"
          icon={Camera}
          buttonText="Capture Info"
          onAction={() => setActiveTab('capture')}
          completed={userData?.touristInfoCaptured}
        />
        
        <ActionCard
          title="Generate PDF"
          description="Create PDF documents from your data"
          icon={Download}
          buttonText="Generate PDF"
          onAction={() => setActiveTab('generate')}
          disabled={!userData?.vcIssued}
        />
        
        <ActionCard
          title="Anchor for Audit"
          description="Anchor your credentials for auditing purposes"
          icon={Anchor}
          buttonText="Anchor Data"
          onAction={() => console.log('Anchor for audit')}
          disabled={!userData?.vcIssued}
        />
      </div>
    </div>
  );

  const renderProfile = () => (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Your registered account details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Full Name</p>
              <p className="text-muted-foreground">{userData?.phone}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Address</p>
              <p className="text-muted-foreground">{userData?.address}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Date of Birth</p>
              <p className="text-muted-foreground">{userData?.dateOfBirth}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Flag className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Nationality</p>
              <p className="text-muted-foreground">{userData?.nationality}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'profile':
        return renderProfile();
      case 'capture':
        return <div className="text-center py-8 text-muted-foreground">Tourist info capture section - Navigate to /dashboard/capture</div>;
      case 'generate':
        return <div className="text-center py-8 text-muted-foreground">Document generation section - Navigate to /dashboard/generate</div>;
      case 'documents':
        return <div className="text-center py-8 text-muted-foreground">Documents section coming soon...</div>;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userEmail={user?.email}
      />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}