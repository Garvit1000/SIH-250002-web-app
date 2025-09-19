import { NextResponse } from "next/server";
import { veramoHelpers } from "@/lib/veramo";
import { processVerifiableCredential } from "@/lib/vc-utils";

/**
 * POST handler for issuing Verifiable Credentials using Veramo
 */
export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { fullName, nationality, emergencyContact, userId, options } = body;

    // Validate required fields
    if (!fullName || !nationality || !emergencyContact) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["fullName", "nationality", "emergencyContact"]
        },
        { status: 400 }
      );
    }

    // Generate userId if not provided
    const targetUserId = userId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('Starting Veramo VC issuance process...');
    console.log('Tourist data:', { fullName, nationality, emergencyContact });

    // Step 1: Create issuer DID
    console.log('Creating issuer DID...');
    const issuerIdentifier = await veramoHelpers.createDID();
    const issuerDid = issuerIdentifier.did;
    console.log("Issuer DID created:", issuerDid);

    // Step 2: Create tourist DID
    console.log('Creating tourist DID...');
    const touristIdentifier = await veramoHelpers.createDID();
    const touristDid = touristIdentifier.did;
    console.log("Tourist DID created:", touristDid);

    // Step 3: Prepare credential subject
    const credentialSubject = {
      fullName: fullName,
      nationality: nationality,
      emergencyContact: emergencyContact,
      credentialType: "Tourist Verification",
      issuedAt: new Date().toISOString()
    };

    // Step 4: Issue the Verifiable Credential
    console.log('Issuing Verifiable Credential...');
    const verifiableCredential = await veramoHelpers.issueCredential({
      issuerDid: issuerDid,
      subjectDid: touristDid,
      credentialSubject: credentialSubject
    });

    console.log("Verifiable Credential issued successfully");
    console.log("Issuer DID:", issuerDid);
    console.log("Tourist DID:", touristDid);

    // Step 5: Verify the issued credential (optional verification step)
    console.log('Verifying issued credential...');
    const verificationResult = await veramoHelpers.verifyCredential(verifiableCredential);
    console.log('Verification result:', verificationResult.verified ? 'VALID' : 'INVALID');

    // Step 6: Process VC with Firebase, QR, and PDF generation
    console.log('Processing VC with Firebase, QR, and PDF...');
    const metadata = {
      issuerDid: issuerDid,
      touristDid: touristDid,
      issuerIdentifier: {
        did: issuerIdentifier.did,
        keys: issuerIdentifier.keys.map(key => ({
          kid: key.kid,
          type: key.type,
          publicKeyHex: key.publicKeyHex
        }))
      },
      touristIdentifier: {
        did: touristIdentifier.did,
        keys: touristIdentifier.keys.map(key => ({
          kid: key.kid,
          type: key.type,
          publicKeyHex: key.publicKeyHex
        }))
      },
      verification: {
        verified: verificationResult.verified,
        issuer: verificationResult.issuer
      },
      framework: "Veramo"
    };

    const processingOptions = {
      qrType: options?.qrType || 'presentation',
      baseUrl: options?.baseUrl || 'https://localhost:3000',
      ...options
    };

    const processResult = await processVerifiableCredential(
      targetUserId,
      verifiableCredential,
      metadata,
      processingOptions
    );

    console.log('Complete VC processing finished successfully');

    // Return comprehensive response with all features
    return NextResponse.json({
      success: true,
      message: "Verifiable Credential issued and processed successfully",
      userId: targetUserId,
      vcId: processResult.vcId,
      credential: verifiableCredential,
      issuerDid: issuerDid,
      touristDid: touristDid,
      firebase: {
        saved: processResult.firebaseStatus === 'saved',
        vcId: processResult.vcId
      },
      qrCode: {
        dataURL: processResult.qrCode.dataURL,
        data: processResult.qrCode.data,
        type: processResult.qrCode.type
      },
      pdf: {
        size: processResult.pdf.size,
        mimeType: processResult.pdf.mimeType,
        // Note: PDF buffer is not included in JSON response due to size
        // Use separate endpoint to download PDF
        downloadUrl: `/api/vc/${targetUserId}/${processResult.vcId}/pdf`
      },
      accessToken: processResult.accessToken,
      verification: {
        verified: verificationResult.verified,
        issuer: verificationResult.issuer,
        verifyUrl: `/api/vc/verify?token=${processResult.accessToken}`
      },
      metadata: processResult.metadata,
      issuedAt: new Date().toISOString(),
      framework: "Veramo"
    }, { status: 200 });

  } catch (error) {
    console.error("Error issuing Verifiable Credential:", error);
    
    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: "Failed to issue Verifiable Credential",
        message: error.message || "An unexpected error occurred",
        framework: "Veramo",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler to check Veramo status and capabilities
 */
export async function GET() {
  try {
    console.log('Testing Veramo agent...');
    
    // Test DID creation
    const testDid = await veramoHelpers.createDID();
    console.log('Test DID created:', testDid.did);
    
    // Test DID resolution
    const resolvedDid = await veramoHelpers.resolveDID(testDid.did);
    console.log('DID resolution successful');
    
    return NextResponse.json({
      status: "Veramo VC Issuer API is running",
      framework: "Veramo",
      capabilities: {
        didGeneration: "✅ Working",
        didResolution: "✅ Working", 
        credentialIssuance: "✅ Ready",
        credentialVerification: "✅ Ready"
      },
      testResults: {
        didCreated: testDid.did,
        didResolved: !!resolvedDid.didDocument,
        keyCount: testDid.keys.length,
        supportedKeyTypes: testDid.keys.map(key => key.type)
      },
      timestamp: new Date().toISOString(),
      endpoints: {
        POST: "Issue a new Verifiable Credential using Veramo",
        GET: "Check Veramo agent status and run tests"
      },
      requiredFields: ["fullName", "nationality", "emergencyContact"],
      examples: {
        curl: `curl -X POST http://localhost:3000/api/issue-vc \\
  -H "Content-Type: application/json" \\
  -d '{"fullName":"John Doe","nationality":"American","emergencyContact":"+1-555-1234"}'`,
        javascript: `fetch('/api/issue-vc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: 'Alice Smith',
    nationality: 'Canadian', 
    emergencyContact: '+1-416-555-0123'
  })
})`
      }
    });
  } catch (error) {
    console.error('Veramo agent test failed:', error);
    
    return NextResponse.json(
      {
        status: "Error",
        framework: "Veramo",
        error: error.message,
        capabilities: {
          didGeneration: "❌ Failed",
          didResolution: "❌ Failed",
          credentialIssuance: "❌ Failed", 
          credentialVerification: "❌ Failed"
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
