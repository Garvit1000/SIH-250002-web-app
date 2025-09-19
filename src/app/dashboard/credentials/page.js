'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import DashboardNav from '@/components/dashboard/DashboardNav';
import QRCodeDisplay from '@/components/vc/QRCodeDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  FileText, 
  Download, 
  ExternalLink, 
  CheckCircle, 
  Clock,
  AlertCircle,
  QrCode
} from 'lucide-react';

export default function CredentialsPage() {
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

  const handleDownloadPDF = () => {
    if (userData?.vcPDFUrl) {
      window.open(userData.vcPDFUrl, '_blank');
    } else if (userData?.vcId) {
      // Fallback to dynamic PDF generation
      window.open(`/api/vc/${user.uid}/${userData.vcId}/pdf`, '_blank');
    }
  };

  const handleVerifyCredential = () => {
    if (userData?.vcVerifyUrl) {
      window.open(userData.vcVerifyUrl, '_blank');
    }
  };

  const getCredentialStatus = () => {
    if (!userData?.vcIssued) {
      return { status: 'pending', label: 'Not Issued', color: 'text-yellow-600', icon: Clock };
    }
    if (userData?.vcIssued) {
      return { status: 'active', label: 'Active', color: 'text-green-600', icon: CheckCircle };
    }
    return { status: 'error', label: 'Error', color: 'text-red-600', icon: AlertCircle };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading credentials...</p>
        </div>
      </div>
    );
  }

  const credentialStatus = getCredentialStatus();
  const StatusIcon = credentialStatus.icon;

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav 
        activeTab="credentials"
        onTabChange={() => {}}
        userEmail={user?.email}
      />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">My Credentials</h1>
            <p className="text-muted-foreground">Manage your verifiable credentials and access verification tools</p>
          </div>

          {/* Credential Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Credential Status</CardTitle>
                  <StatusIcon className={`h-5 w-5 ${credentialStatus.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${credentialStatus.color}`}>
                  {credentialStatus.label}
                </div>
                <p className="text-xs text-muted-foreground">
                  {userData?.vcIssuedAt ? `Issued: ${new Date(userData.vcIssuedAt).toLocaleDateString()}` : 'Not yet issued'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">DID Status</CardTitle>
                  <Shield className={`h-5 w-5 ${userData?.didCreated ? 'text-green-600' : 'text-yellow-600'}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${userData?.didCreated ? 'text-green-600' : 'text-yellow-600'}`}>
                  {userData?.didCreated ? 'Active' : 'Pending'}
                </div>
                <p className="text-xs text-muted-foreground">Decentralized Identity</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Documents</CardTitle>
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {userData?.vcIssued ? 'Ready' : 'Pending'}
                </div>
                <p className="text-xs text-muted-foreground">PDF & QR Available</p>
              </CardContent>
            </Card>
          </div>

          {userData?.vcIssued ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* QR Code Display */}
              <div>
                <QRCodeDisplay
                  qrData={userData?.vcQRCode?.dataURL}
                  verifyUrl={userData?.vcVerifyUrl}
                  accessToken={userData?.vcAccessToken}
                  vcId={userData?.vcId}
                />
              </div>

              {/* Credential Details */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Credential Information</CardTitle>
                    <CardDescription>Your verifiable credential details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Credential ID</label>
                        <p className="text-sm font-mono bg-muted p-2 rounded">{userData?.vcId || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Issuer DID</label>
                        <p className="text-sm font-mono bg-muted p-2 rounded break-all">{userData?.issuerDid || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Subject DID</label>
                        <p className="text-sm font-mono bg-muted p-2 rounded break-all">{userData?.touristDid || 'N/A'}</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">QR Code Type</label>
                        <p className="text-sm">{userData?.vcQRCode?.type || 'presentation'}</p>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <Button onClick={handleDownloadPDF} className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF with QR Code
                      </Button>
                      
                      <Button onClick={handleVerifyCredential} variant="outline" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Verify Credential Online
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                    <CardDescription>Additional credential operations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      onClick={() => window.location.href = '/dashboard/generate'} 
                      variant="outline" 
                      className="w-full"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Generate More Documents
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        if (userData?.vcQRCode?.dataURL) {
                          const link = document.createElement('a');
                          link.href = userData.vcQRCode.dataURL;
                          link.download = `qr_code_${userData.vcId}.png`;
                          link.click();
                        }
                      }}
                      variant="outline" 
                      className="w-full"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Download QR Code Only
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Credentials Yet</CardTitle>
                <CardDescription>You haven't issued any verifiable credentials yet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Start by creating your DID and issuing your first verifiable credential
                  </p>
                  <Button onClick={() => window.location.href = '/dashboard'}>
                    Go to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}