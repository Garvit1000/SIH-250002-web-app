"use client";

import { useEffect, useState } from "react";

export default function VerifyPage() {
    const [status, setStatus] = useState("loading");
    const [details, setDetails] = useState(null);

    useEffect(() => {
        // Get token from URL ?token=...
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
            setStatus("error");
            return;
        }

        async function verifyCredential() {
            try {
                const res = await fetch(`/api/vc/verify?token=${token}`);
                const data = await res.json();

                if (data.success && data.verified) {
                    setStatus("verified");
                    setDetails(data.details || {});
                } else {
                    setStatus("invalid");
                }
            } catch (err) {
                console.error("Verification error:", err);
                setStatus("error");
            }
        }

        verifyCredential();
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
            {status === "loading" && (
                <p className="text-lg font-semibold text-gray-700">Verifying credential...</p>
            )}

            {status === "verified" && (
                <div className="bg-white shadow-lg rounded-xl p-6 text-center max-w-md w-full">
                    <h1 className="text-2xl font-bold text-green-600 mb-2">✅ Credential Verified</h1>
                    <p className="text-gray-700 mb-4">This credential is valid and issued by a trusted source.</p>

                    {details && (
                        <div className="bg-gray-100 rounded-lg p-4 text-left text-sm">
                            {Object.entries(details).map(([key, value]) => (
                                <p key={key}>
                                    <span className="font-semibold">{key}: </span>
                                    {String(value)}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {status === "invalid" && (
                <p className="text-lg font-semibold text-red-600">❌ Invalid or expired credential.</p>
            )}

            {status === "error" && (
                <p className="text-lg font-semibold text-red-500">⚠️ Error verifying credential.</p>
            )}
        </div>
    );
}
