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
      // Simulate document generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setGenerated({ ...generated, [docId]: true });
      onGenerate && onGenerate(docId);
    } catch (error) {
      console.error('Error generating document:', error);
    } finally {
      setGenerating({ ...generating, [docId]: false });
    }
  };

  const isDocumentReady = (doc) => {
    return doc.required.every(field => {
      if (field === 'touristInfo') {
        return userData?.touristInfoCaptured;
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
