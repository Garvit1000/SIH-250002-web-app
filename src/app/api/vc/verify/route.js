import { NextResponse } from 'next/server';
import { getVCFromFirebase } from '@/lib/vc-utils';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

/**
 * GET handler for VC verification via token
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Missing verification token' },
        { status: 400 }
      );
    }

    // Verify and decode the JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { userId, vcId } = decoded;

    if (!userId || !vcId) {
      return NextResponse.json(
        { error: 'Invalid token payload' },
        { status: 400 }
      );
    }

    // Retrieve VC from Firebase
    const vcData = await getVCFromFirebase(userId, vcId);

    // Return verification result
    return NextResponse.json({
      success: true,
      verified: true,
      vcId: vcId,
      userId: userId,
      credential: vcData.credential,
      metadata: vcData.metadata,
      verifiedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error verifying VC:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to verify credential',
        message: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler for VC verification via direct credential submission
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { vcId, userId, credential } = body;

    if (!vcId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: vcId, userId' },
        { status: 400 }
      );
    }

    // Try to retrieve and verify VC from Firebase
    let vcData;
    try {
      vcData = await getVCFromFirebase(userId, vcId);
    } catch (firebaseError) {
      return NextResponse.json(
        { 
          success: false,
          verified: false,
          error: 'Credential not found in database'
        },
        { status: 404 }
      );
    }

    // Basic verification - check if stored credential matches submitted one
    let credentialMatch = true;
    if (credential) {
      credentialMatch = JSON.stringify(vcData.credential) === JSON.stringify(credential);
    }

    return NextResponse.json({
      success: true,
      verified: credentialMatch && vcData.metadata.status === 'active',
      vcId: vcId,
      userId: userId,
      credentialMatch: credentialMatch,
      status: vcData.metadata.status,
      issuedAt: vcData.metadata.createdAt,
      verifiedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in POST verification:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to verify credential',
        message: error.message
      },
      { status: 500 }
    );
  }
}