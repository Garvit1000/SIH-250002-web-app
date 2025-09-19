import { NextResponse } from 'next/server';
import { getVCFromFirebase, generateVCQRCode, generateVCPDF } from '@/lib/vc-utils';

/**
 * GET handler for downloading VC as PDF
 */
export async function GET(request, { params }) {
  try {
    const { userId, vcId } = params;

    if (!userId || !vcId) {
      return NextResponse.json(
        { error: 'Missing userId or vcId' },
        { status: 400 }
      );
    }

    // Retrieve VC from Firebase
    const vcData = await getVCFromFirebase(userId, vcId);

    if (!vcData) {
      return NextResponse.json(
        { error: 'VC not found' },
        { status: 404 }
      );
    }

    // Generate fresh QR code for the PDF
    const { searchParams } = new URL(request.url);
    const qrType = searchParams.get('qrType') || 'presentation';
    const baseUrl = searchParams.get('baseUrl') || 'https://localhost:3000';

    const qrResult = await generateVCQRCode(vcId, userId, baseUrl, qrType);

    // Generate PDF
    const pdfBuffer = await generateVCPDF(vcData, qrResult.qrCodeDataURL);

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="vc_${vcId}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating PDF download:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate PDF',
        message: error.message
      },
      { status: 500 }
    );
  }
}