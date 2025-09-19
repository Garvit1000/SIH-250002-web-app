import { adminDb } from "./firebaseAdmin.js";
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import jwt from 'jsonwebtoken';

// JWT secret for signed tokens (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

/**
 * Save Verifiable Credential to Firebase
 * @param {string} userId - User identifier
 * @param {object} credential - The verifiable credential object
 * @param {object} metadata - Additional metadata (issuer info, etc.)
 * @returns {Promise<string>} - Document ID
 */
export async function saveVCToFirebase(userId, credential, metadata = {}) {
    try {
        const vcId = `vc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const vcData = {
            id: vcId,
            userId: userId,
            credential,
            metadata: {
                ...metadata,
                createdAt: new Date().toISOString(),
                status: "active",
            },
        };

        // Use Admin SDK -> bypasses rules 🚀
        await adminDb
            .collection("credentials")
            .doc(userId)
            .collection("vcs")
            .doc(vcId)
            .set(vcData);

        console.log(`✅ VC saved to Firebase with ID: ${vcId}`);
        return vcId;
    } catch (error) {
        console.error("❌ Error saving VC to Firebase:", error);
        throw error;
    }
}

/**
 * Retrieve Verifiable Credential from Firebase
 * @param {string} userId - User identifier
 * @param {string} vcId - VC identifier
 * @returns {Promise<object>} - VC data
 */
export async function getVCFromFirebase(userId, vcId) {
    try {
        // Use Admin SDK for consistent access
        const docSnap = await adminDb
            .collection('credentials')
            .doc(userId)
            .collection('vcs')
            .doc(vcId)
            .get();

        if (docSnap.exists) {
            return docSnap.data();
        } else {
            throw new Error('VC not found');
        }
    } catch (error) {
        console.error('Error retrieving VC from Firebase:', error);
        throw error;
    }
}

/**
 * Generate a signed JWT token for VC access
 * @param {string} userId - User identifier
 * @param {string} vcId - VC identifier
 * @param {number} expiresIn - Token expiration in seconds (default: 1 hour)
 * @returns {string} - Signed JWT token
 */
export function generateVCAccessToken(userId, vcId, expiresIn = 3600) {
    const payload = {
        userId: userId,
        vcId: vcId,
        type: 'vc_access',
        iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Generate QR code for VC presentation
 * @param {string} vcId - VC identifier
 * @param {string} userId - User identifier
 * @param {string} baseUrl - Base URL for the application
 * @returns {Promise<string>} - Base64 encoded QR code image
 */
export async function generateVCQRCode(vcId, userId, baseUrl = 'https://yourapp.com') {
    try {
        // Always use Firebase link with signed JWT
        const token = generateVCAccessToken(userId, vcId, 3600); // 1 hour expiry
        const qrData = `${baseUrl}/api/vc/verify?token=${token}`;

        // Generate QR code as base64 image
        const qrCodeDataURL = await QRCode.toDataURL(qrData, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            quality: 0.92,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            width: 256
        });

        return {
            qrCodeDataURL,
            qrData,
            type: 'firebase'
        };
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
}

/**
 * Generate PDF with embedded QR code using jsPDF
 * @param {object} vcData - VC data object
 * @param {string} qrCodeDataURL - Base64 QR code image
 * @param {object} options - PDF generation options
 * @returns {Promise<Buffer>} - PDF buffer
 */
export async function generateVCPDF(vcData, qrCodeDataURL, options = {}) {
    try {
        console.log('Generating PDF using jsPDF...');

        // Create new jsPDF instance
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Title
        doc.setFontSize(20);
        doc.text('Verifiable Credential', 105, 30, { align: 'center' });

        // Credential Details Section
        doc.setFontSize(14);
        doc.text('Credential Details:', 20, 50);

        doc.setFontSize(10);
        const details = [
            `Credential ID: ${vcData.id || 'N/A'}`,
            `User ID: ${vcData.userId || 'N/A'}`,
            `Issued At: ${vcData.metadata?.createdAt || new Date().toISOString()}`,
            `Status: ${vcData.metadata?.status || 'Active'}`
        ];

        let yPos = 60;
        details.forEach(detail => {
            doc.text(detail, 20, yPos);
            yPos += 8;
        });

        // Subject Information
        if (vcData.credential?.credentialSubject) {
            const subject = vcData.credential.credentialSubject;

            yPos += 10;
            doc.setFontSize(14);
            doc.text('Subject Information:', 20, yPos);

            yPos += 10;
            doc.setFontSize(10);

            Object.entries(subject).forEach(([key, value]) => {
                if (key !== 'id') {
                    const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    doc.text(`${displayKey}: ${value}`, 20, yPos);
                    yPos += 8;
                }
            });
        }

        // QR Code Section
        yPos += 20;
        doc.setFontSize(14);
        doc.text('Verification QR Code:', 20, yPos);

        // Add QR code if provided
        if (qrCodeDataURL) {
            yPos += 10;
            doc.addImage(qrCodeDataURL, 'PNG', 70, yPos, 50, 50);
            yPos += 60;
        }

        // Instructions
        doc.setFontSize(8);
        doc.text('Scan the QR code above to verify this credential.', 105, yPos, { align: 'center' });
        doc.text('This document contains a digitally verifiable credential.', 105, yPos + 5, { align: 'center' });

        // Footer
        yPos += 20;
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, yPos, { align: 'center' });
        doc.text('Powered by Veramo & Firebase', 105, yPos + 5, { align: 'center' });

        // Convert to buffer
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

        console.log('PDF generated successfully with jsPDF');
        return pdfBuffer;

    } catch (error) {
        console.error('Error generating PDF with jsPDF:', error);
        throw error;
    }
}

/**
 * Complete VC processing: Save to Firebase, Generate QR, Create PDF
 * @param {string} userId - User identifier
 * @param {object} credential - Verifiable credential
 * @param {object} metadata - Additional metadata
 * @param {object} options - Processing options
 * @returns {Promise<object>} - Complete processing result
 */
export async function processVerifiableCredential(userId, credential, metadata = {}, options = {}) {
    try {
        console.log('Starting complete VC processing...');

        // Step 1: Save VC to Firebase
        const vcId = await saveVCToFirebase(userId, credential, metadata);
        console.log(`VC saved with ID: ${vcId}`);

        // Step 2: Generate Firebase QR Code (always)
        const baseUrl = options.baseUrl || 'https://localhost:3000';
        const qrResult = await generateVCQRCode(vcId, userId, baseUrl, 'firebase');
        console.log(`QR code generated (firebase)`);

        // Step 3: Create PDF with QR code
        const vcData = {
            id: vcId,
            userId: userId,
            credential: credential,
            metadata: {
                ...metadata,
                createdAt: new Date().toISOString(),
                status: 'active'
            }
        };

        const pdfBuffer = await generateVCPDF(vcData, qrResult.qrCodeDataURL);
        console.log('PDF generated successfully');

        return {
            vcId: vcId,
            firebaseStatus: 'saved',
            qrCode: {
                dataURL: qrResult.qrCodeDataURL,
                data: qrResult.qrData,
                type: 'firebase'
            },
            pdf: {
                buffer: pdfBuffer,
                size: pdfBuffer.length,
                mimeType: 'application/pdf'
            },
            accessToken: generateVCAccessToken(userId, vcId),
            metadata: vcData.metadata
        };

    } catch (error) {
        console.error('Error in complete VC processing:', error);
        throw error;
    }
}
