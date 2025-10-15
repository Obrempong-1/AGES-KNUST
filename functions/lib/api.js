"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
admin.initializeApp();
const bucket = admin.storage().bucket("piwc-asokwa-site.firebasestorage.app");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
/**
 * Generates a signed V4 URL for uploading a file directly to Firebase Storage.
 */
app.post("/generate-upload-url", async (req, res) => {
    const { fileName, contentType, path } = req.body;
    if (!fileName || !contentType || !path) {
        return res.status(400).json({ error: "Missing required fields: fileName, contentType, and path." });
    }
    const allowedPaths = ["executives", "gallery", "content", "news", "events", "personalities", "blogs", "announcements"];
    if (!allowedPaths.includes(path)) {
        return res.status(400).json({ error: "Invalid upload path specified." });
    }
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '');
    const uniqueFileName = `${path}/${Date.now()}_${sanitizedFileName}`;
    const file = bucket.file(uniqueFileName);
    const options = {
        version: "v4",
        action: "write",
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        contentType: contentType,
    };
    try {
        const [uploadUrl] = await file.getSignedUrl(options);
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueFileName}`;
        return res.status(200).json({ uploadUrl, publicUrl });
    }
    catch (error) {
        console.error("Failed to generate signed URL:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred on the server.";
        return res.status(500).json({
            error: "Could not create upload URL. Please check server logs.",
            detailedError: errorMessage,
        });
    }
});
/**
 * Deletes an image from Firebase Storage.
 */
app.post("/delete-image", async (req, res) => {
    const { publicUrl } = req.body;
    if (!publicUrl) {
        return res.status(400).json({ error: "publicUrl is required." });
    }
    try {
        const path = publicUrl.split(`${bucket.name}/`)[1];
        await bucket.file(path).delete();
        return res.status(200).json({ message: "Image deleted successfully." });
    }
    catch (error) {
        console.error("Failed to delete image:", error);
        if (error.code === 404) {
            return res.status(200).json({ message: "Image already deleted or not found." });
        }
        return res.status(500).json({ message: "Image could not be deleted." });
    }
});
// --- Other Endpoints (Unchanged) ---
app.post("/send-email", async (req, res) => {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: "Missing required fields: name, email, message" });
    }
    try {
        await admin.firestore().collection("mail").add({
            to: "info@agesknust.com",
            replyTo: email,
            message: {
                subject: `New Contact Form Submission from ${name}`,
                html: `
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
                    <p><strong>Message:</strong></p>
                    <p>${message}</p>
                `,
            },
        });
        return res.status(200).json({ message: "Email queued for sending successfully" });
    }
    catch (error) {
        console.error("Error queueing email:", error);
        return res.status(500).json({ error: "Failed to queue email for sending" });
    }
});
exports.api = functions.runWith({ memory: "256MB" }).https.onRequest(app);
//# sourceMappingURL=api.js.map