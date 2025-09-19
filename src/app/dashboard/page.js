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
      // For now, just mark DID as created in Firebase
      // In a full implementation, you might want to create the DID separately
      await updateDoc(doc(db, 'users', user.uid), {
        didCreated: true,
        didCreatedAt: new Date().toISOString()
      });
      fetchUserData();
      alert('DID created successfully! You can now issue Verifiable Credentials.');
    } catch (error) {
      console.error('Error creating DID:', error);
      alert('Error creating DID. Please try again.');
    }
  };

  const handleIssueVC = async () => {
    try {
      // Get user data with required fields for VC (use phone as emergency contact if emergencyContact not available)
      const emergencyContact = userData?.emergencyContact || userData?.phone;
      
      if (!userData?.fullName || !userData?.nationality || !emergencyContact) {
        alert('Please complete your profile with full name, nationality, and phone number before issuing VC');
        return;
      }

      console.log('Issuing VC with enhanced features:', {
        fullName: userData.fullName,
        nationality: userData.nationality,
        emergencyContact: emergencyContact
      });

      // Call our enhanced VC API with QR and PDF generation
      const response = await fetch('/api/issue-vc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: userData.fullName,
          nationality: userData.nationality,
          emergencyContact: emergencyContact,
          userId: user.uid, // Use Firebase user ID
          options: {
            qrType: 'presentation',
            baseUrl: window.location.origin
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update Firebase with enhanced VC data
        await updateDoc(doc(db, 'users', user.uid), {
          vcIssued: true,
          vcIssuedAt: new Date().toISOString(),
          vcData: result.credential,
          issuerDid: result.issuerDid,
          touristDid: result.touristDid,
          // Store new VC features
          vcId: result.vcId,
          vcQRCode: result.qrCode,
          vcPDFUrl: result.pdf.downloadUrl,
          vcVerifyUrl: result.verification.verifyUrl,
          vcAccessToken: result.accessToken
        });
        
        fetchUserData();
        
        // Enhanced success message
        const successMessage = `✅ Verifiable Credential issued successfully!
        
🆔 VC ID: ${result.vcId}
🔗 Issuer DID: ${result.issuerDid}
👤 Tourist DID: ${result.touristDid}
📱 QR Code: Generated
📄 PDF: Ready for download
🔐 Verification URL: Available

Features:
• QR code for instant verification
• PDF document with embedded QR
• Firebase storage for secure access
• JWT token for verification

You can now generate documents and verify your credentials!`;

        alert(successMessage);
        
        // Optionally auto-navigate to generate page
        if (confirm('Would you like to go to the document generation page now?')) {
          setActiveTab('generate');
        }
      } else {
        console.error('VC issuance failed:', result.error);
        alert(`Failed to issue VC: ${result.message}`);
      }
    } catch (error) {
      console.error('Error issuing VC:', error);
      alert('Error issuing Verifiable Credential. Please try again.');
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
          title="Create DID"
          description="Generate your decentralized identity first"
          icon={Shield}
          buttonText="Create DID"
          onAction={handleCreateDID}
          disabled={false}
          completed={userData?.didCreated}
        />
        
        <ActionCard
          title="Issue Verifiable Credential"
          description="Issue VC with QR code, PDF generation & Firebase storage"
          icon={FileText}
          buttonText="Issue Enhanced VC"
          onAction={handleIssueVC}
          disabled={!userData?.didCreated}
          completed={userData?.vcIssued}
        />
        
        <ActionCard
          title="Generate Grid"
          description="Create your identity grid system"
          icon={Grid3x3}
          buttonText="Generate Grid"
          onAction={() => console.log('Generate Grid')}
          disabled={!userData?.vcIssued}
          completed={false}
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
              <p className="text-muted-foreground">{userData?.fullName || 'Not provided'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Phone / Emergency Contact</p>
              <p className="text-muted-foreground">{userData?.phone || userData?.emergencyContact || 'Not provided'}</p>
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