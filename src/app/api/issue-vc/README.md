# Veramo Verifiable Credential API

This API endpoint allows you to issue, verify, and manage Verifiable Credentials using the Veramo framework - a TypeScript framework for Verifiable Data.

## Features

- ✅ **DID Generation**: Creates cryptographically secure DIDs using `did:key` method
- ✅ **VC Issuance**: Issues W3C compliant Verifiable Credentials
- ✅ **VC Verification**: Verifies credentials with cryptographic proof
- ✅ **Self-contained**: No external API dependencies
- ✅ **Production Ready**: Uses Veramo's battle-tested cryptographic libraries

## Setup

### Environment Configuration
Add to your `.env.local` file:
```
KMS_SECRET_KEY=your_32_character_hex_secret_key_here
```

## API Endpoints

### POST `/api/issue-vc`

Issues a new Verifiable Credential for a tourist using Veramo.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "nationality": "American",
  "emergencyContact": "+1-555-123-4567"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Verifiable Credential issued successfully using Veramo",
  "credential": {
    "credentialSubject": {
      "id": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
      "fullName": "John Doe",
      "nationality": "American",
      "emergencyContact": "+1-555-123-4567",
      "credentialType": "Tourist Verification"
    },
    "issuer": {
      "id": "did:key:z6MkiTBz1ymuepAQ4HEHYSF1H8quG5GLVVQR3djdX3mDooWp"
    },
    "type": ["VerifiableCredential", "TouristCredential"],
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "issuanceDate": "2024-01-01T10:00:00.000Z",
    "proof": {
      "type": "JwtProof2020",
      "jwt": "eyJ0eXAiOiJKV1QiLCJhbGciOiJFZERTQSJ9..."
    }
  },
  "issuerDid": "did:key:z6MkiTBz1ymuepAQ4HEHYSF1H8quG5GLVVQR3djdX3mDooWp",
  "touristDid": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
  "verification": {
    "verified": true,
    "issuer": "did:key:z6MkiTBz1ymuepAQ4HEHYSF1H8quG5GLVVQR3djdX3mDooWp"
  },
  "framework": "Veramo"
}
```

### GET `/api/issue-vc`

Check API status and run Veramo agent tests.

**Response:**
```json
{
  "status": "Veramo VC Issuer API is running",
  "framework": "Veramo",
  "capabilities": {
    "didGeneration": "✅ Working",
    "didResolution": "✅ Working",
    "credentialIssuance": "✅ Ready",
    "credentialVerification": "✅ Ready"
  },
  "testResults": {
    "didCreated": "did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH",
    "didResolved": true,
    "keyCount": 1,
    "supportedKeyTypes": ["Ed25519"]
  }
}
```

## Example Usage

### Using curl:

```bash
curl -X POST http://localhost:3000/api/issue-vc \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Alice Smith",
    "nationality": "Canadian",
    "emergencyContact": "+1-416-555-0123"
  }'
```

### Using fetch API:

```javascript
const issueCredential = async (touristData) => {
  try {
    const response = await fetch('/api/issue-vc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(touristData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Credential issued:', result.credential);
      console.log('Issuer DID:', result.issuerDid);
      console.log('Tourist DID:', result.touristDid);
      console.log('Verification status:', result.verification.verified);
      return result;
    } else {
      console.error('Error:', result.error);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Failed to issue credential:', error);
    throw error;
  }
};

// Usage
const touristData = {
  fullName: "Bob Johnson",
  nationality: "British",
  emergencyContact: "+44-20-7946-0958"
};

issueCredential(touristData)
  .then(result => console.log('Success:', result))
  .catch(error => console.error('Error:', error));
```

### Using in a React component:

```jsx
import { useState } from 'react';

export default function IssueCredentialForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    nationality: '',
    emergencyContact: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/issue-vc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Full Name"
        value={formData.fullName}
        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
        required
      />
      <input
        type="text"
        placeholder="Nationality"
        value={formData.nationality}
        onChange={(e) => setFormData({...formData, nationality: e.target.value})}
        required
      />
      <input
        type="text"
        placeholder="Emergency Contact"
        value={formData.emergencyContact}
        onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Issuing...' : 'Issue Credential'}
      </button>
      
      {result && (
        <div>
          {result.success ? (
            <div>
              <p>✅ Credential issued successfully!</p>
              <p>Issuer DID: {result.issuerDid}</p>
              <p>Tourist DID: {result.touristDid}</p>
              <p>Verified: {result.verification.verified ? '✅' : '❌'}</p>
            </div>
          ) : (
            <p>❌ Error: {result.error}</p>
          )}
        </div>
      )}
    </form>
  );
}
```

## Technical Details

### Veramo Framework
- **DID Method**: `did:key` (self-sovereign, no blockchain required)
- **Key Type**: Ed25519 (high security, performance optimized)
- **Proof Format**: JWT (JSON Web Token) with Ed25519 signature
- **Storage**: In-memory (development) / Database (production)

### Credential Structure
The issued credentials follow W3C Verifiable Credentials 1.1 specification:
- **@context**: Standard W3C context
- **type**: VerifiableCredential + TouristCredential
- **issuer**: DID of the issuing authority
- **issuanceDate**: When the credential was issued
- **credentialSubject**: Tourist's information
- **proof**: Cryptographic proof (JWT format)

### Security Features
- ✅ Cryptographic signatures using Ed25519
- ✅ DID-based identity (no central authority required)
- ✅ Tamper-evident credentials
- ✅ Verifiable without contacting issuer
- ✅ Privacy-preserving (selective disclosure possible)

## Advantages over Trinsic
1. **No External Dependencies**: Self-contained, works offline
2. **No API Limits**: No rate limiting or quota restrictions  
3. **Full Control**: Complete control over key management
4. **Cost Effective**: No per-credential charges
5. **Standards Compliant**: Pure W3C implementation
6. **Open Source**: Full transparency and auditability

## Production Considerations

1. **Key Storage**: Replace in-memory stores with proper database
2. **Secret Management**: Use secure secret management for KMS_SECRET_KEY
3. **Backup**: Implement key backup and recovery procedures
4. **Monitoring**: Add logging and monitoring for credential issuance
5. **Rate Limiting**: Add rate limiting for API endpoints