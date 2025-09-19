'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Copy, ExternalLink, QrCode } from 'lucide-react';

const QRCodeDisplay = ({ qrData, verifyUrl, accessToken, vcId }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyQRData = async () => {
    try {
      await navigator.clipboard.writeText(qrData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownloadQR = () => {
    // This would typically receive the QR code as base64
    if (qrData) {
      const link = document.createElement('a');
      link.href = qrData; // Assuming qrData is base64 image
      link.download = `qr_code_${vcId || 'credential'}.png`;
      link.click();
    }
  };

  const handleVerify = () => {
    if (verifyUrl) {
      window.open(verifyUrl, '_blank');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <QrCode className="h-6 w-6 text-primary mr-2" />
          <CardTitle className="text-lg">Verification QR Code</CardTitle>
        </div>
        <CardDescription>
          Scan this QR code to verify your credential
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* QR Code Display */}
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
            {qrData ? (
              <img 
                src={qrData} 
                alt="QR Code for Credential Verification"
                className="w-48 h-48 object-contain"
              />
            ) : (
              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded">
                <QrCode className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* QR Info */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            QR Type: Presentation Request
          </p>
          {vcId && (
            <p className="text-xs text-muted-foreground">
              VC ID: {vcId}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleDownloadQR}
            variant="outline"
            size="sm"
            disabled={!qrData}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          
          <Button
            onClick={handleCopyQRData}
            variant="outline"
            size="sm"
            disabled={!qrData}
          >
            <Copy className="h-4 w-4 mr-1" />
            {copied ? 'Copied!' : 'Copy Data'}
          </Button>
        </div>

        <Button
          onClick={handleVerify}
          className="w-full"
          disabled={!verifyUrl}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Verification Page
        </Button>

        {/* Technical Details (Collapsible) */}
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground">
            Technical Details
          </summary>
          <div className="mt-2 p-2 bg-muted rounded text-xs font-mono break-all">
            <p><strong>QR Data:</strong></p>
            <p className="mb-2">{qrData || 'Not available'}</p>
            {accessToken && (
              <>
                <p><strong>Access Token:</strong></p>
                <p className="mb-2">{accessToken}</p>
              </>
            )}
            {verifyUrl && (
              <>
                <p><strong>Verify URL:</strong></p>
                <p>{verifyUrl}</p>
              </>
            )}
          </div>
        </details>
      </CardContent>
    </Card>
  );
};

export default QRCodeDisplay;