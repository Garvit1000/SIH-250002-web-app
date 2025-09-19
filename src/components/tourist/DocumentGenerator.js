'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {Button } from '@/components/ui/button';
import { FileText, Download, CheckCircle, Clock } from 'lucide-react';

const DocumentGenerator = ({ userData, onGenerate }) => {
  const [generating, setGenerating] = useState({});
  const [generated, setGenerated] = useState({});

  const documents = [
    {
      id: 'verifiable_credential',
      title: 'Verifiable Credential',
      description: 'Issue blockchain-based verifiable credential',
      icon: FileText,
      required: ['fullName', 'nationality', 'emergencyContact'],
      isVC: true
    },
    {
      id: 'identity_certificate',
      title: 'Identity Certificate',
      description: 'Official identity verification document',
      icon: FileText,
      required: ['fullName', 'dateOfBirth', 'nationality']
    },
    {
      id: 'tourist_credentials',
      title: 'Tourist Credentials',
      description: 'Verified tourist information and credentials',
      icon: FileText,
      required: ['touristInfo']
    },
    {
      id: 'verification_report',
      title: 'Verification Report',
      description: 'Complete verification status report',
      icon: FileText,
      required: ['didCreated', 'vcIssued']
    },
    {
      id: 'travel_document',
      title: 'Travel Document',
      description: 'Travel authorization and details',
      icon: FileText,
      required: ['touristInfo', 'accommodationAddress']
    }
  ];

  const handleGenerate = async (docId) => {
    setGenerating({ ...generating, [docId]: true });
    
    try {
      const doc = documents.find(d => d.id === docId);
      
      if (doc?.isVC) {
        // Handle Verifiable Credential issuance with enhanced features
        const response = await fetch('/api/issue-vc', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: userData.fullName,
            nationality: userData.nationality,
            emergencyContact: userData.emergencyContact || userData.phone,
            userId: userData.userId || `user_${Date.now()}`,
            options: {
              qrType: 'presentation', // or 'firebase'
              baseUrl: window.location.origin
            }
          })
        });

        const result = await response.json();
        
        if (result.success) {
          console.log('VC issued successfully with QR and PDF:', result);
          
          // Store VC info for later use
          setGenerated({
            ...generated,
            [docId]: {
              success: true,
              vcId: result.vcId,
              userId: result.userId,
              qrCode: result.qrCode,
              pdfDownloadUrl: result.pdf.downloadUrl,
              verifyUrl: result.verification.verifyUrl,
              accessToken: result.accessToken
            }
          });

          // Show success message with options
          const message = `✅ Verifiable Credential issued successfully!
          
🆔 VC ID: ${result.vcId}
🔗 Issuer DID: ${result.issuerDid}
👤 Tourist DID: ${result.touristDid}
📱 QR Code: Generated (${result.qrCode.type})
📄 PDF: Ready for download
🔐 Verification: ${result.verification.verifyUrl}

You can now download the PDF with embedded QR code or verify the credential using the QR code.`;
          
          alert(message);
          onGenerate && onGenerate(docId, result);
        } else {
          throw new Error(result.message || 'Failed to issue VC');
        }
      } else {
        // Simulate document generation for other documents
        await new Promise(resolve => setTimeout(resolve, 2000));
        setGenerated({ ...generated, [docId]: true });
        onGenerate && onGenerate(docId);
      }
    } catch (error) {
      console.error('Error generating document:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setGenerating({ ...generating, [docId]: false });
    }
  };

  const isDocumentReady = (doc) => {
    return doc.required.every(field => {
      if (field === 'touristInfo') {
        return userData?.touristInfoCaptured;
      }
      if (field === 'emergencyContact') {
        return userData?.emergencyContact || userData?.phone;
      }
      if (field === 'didCreated' || field === 'vcIssued') {
        return userData?.[field];
      }
      return userData?.[field];
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Document Generator</CardTitle>
          <CardDescription>
            Generate PDF documents from your verified credentials
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => {
          const ready = isDocumentReady(doc);
          const isGenerating = generating[doc.id];
          const isGenerated = generated[doc.id];

          return (
            <Card key={doc.id} className={`transition-all ${ready ? 'hover:shadow-md' : 'opacity-60'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${ready ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      <doc.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{doc.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {doc.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {isGenerated && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    Requirements: {doc.required.map(req => req.replace(/([A-Z])/g, ' $1').toLowerCase()).join(', ')}
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleGenerate(doc.id)}
                      disabled={!ready || isGenerating}
                      variant={isGenerated ? "outline" : "default"}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : isGenerated ? (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          Generate PDF
                        </>
                      )}
                    </Button>

                    {/* Additional actions for VC documents */}
                    {doc.isVC && isGenerated && generated[doc.id]?.pdfDownloadUrl && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => window.open(generated[doc.id].pdfDownloadUrl, '_blank')}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          PDF
                        </Button>
                        <Button
                          onClick={() => {
                            if (generated[doc.id]?.qrCode?.dataURL) {
                              // Create a temporary link to download QR code
                              const link = document.createElement('a');
                              link.href = generated[doc.id].qrCode.dataURL;
                              link.download = `qr_code_${generated[doc.id].vcId}.png`;
                              link.click();
                            }
                          }}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          📱 QR
                        </Button>
                          <Button
                              onClick={() => {
                                  const token = generated[doc.id]?.accessToken;
                                  if (token) {
                                      window.open(`/verify?token=${token}`, '_blank');
                                  }
                              }}
                              variant="outline"
                              size="sm"
                              className="flex-1"
                          >
                              🔐 Verify
                          </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentGenerator;
