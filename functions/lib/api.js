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
const mail_1 = __importDefault(require("@sendgrid/mail"));
admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();
const bucket = admin.storage().bucket("piwc-asokwa-site.firebasestorage.app");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
// Set SendGrid API Key
const sendgridApiKey = functions.config().sendgrid?.key;
if (sendgridApiKey) {
    mail_1.default.setApiKey(sendgridApiKey);
    console.log("SendGrid API key set.");
}
else {
    console.error("SendGrid API key is missing. Ensure functions:config:set sendgrid.key is set.");
}
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
app.post("/send-email", async (req, res) => {
    if (!sendgridApiKey) {
        console.error("Email service not configured. SendGrid API key is missing.");
        return res.status(500).json({ error: "Email service is not configured on the server." });
    }
    const { name, email, phone, message, subject } = req.body;
    if (!name || !email || !message || !subject) {
        return res.status(400).json({ error: "Missing required fields: name, email, message, subject" });
    }
    // IMPORTANT: This email must be a verified sender in your SendGrid account.
    const verifiedSender = "obrempong.kow@gmail.com";
    const msg = {
        to: verifiedSender, // The email address that will receive the message
        from: {
            name: "Contact Form - PIWC Asokwa",
            email: verifiedSender, // This must be a verified sender
        },
        replyTo: {
            name: name,
            email: email
        },
        subject: `New Contact Form Submission: ${subject}`,
        html: `
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        `
    };
    try {
        await mail_1.default.send(msg);
        return res.status(200).json({ message: "Email sent successfully" });
    }
    catch (error) {
        console.error("Error sending email with SendGrid:", error);
        if (error.response) {
            console.error(error.response.body);
        }
        return res.status(500).json({ error: "Failed to send email." });
    }
});
exports.api = functions.runWith({ memory: "256MB" }).https.onRequest(app);
exports.sendNotificationOnNewAnnouncement = functions.firestore
    .document("announcements/{announcementId}")
    .onCreate(async (snapshot) => {
    const announcement = snapshot.data();
    const payload = {
        notification: {
            title: "New Announcement!",
            body: announcement.title,
        },
        webpush: {
            fcm_options: {
                link: "/",
            },
        },
    };
    const tokensCollection = await db.collection("fcm_tokens").get();
    const tokens = tokensCollection.docs.map((doc) => doc.data().token);
    if (tokens.length > 0) {
        await messaging.sendToDevice(tokens, payload);
    }
});
exports.sendNotificationOnNewNewsEvent = functions.firestore
    .document("newsEvents/{newsEventId}")
    .onCreate(async (snapshot) => {
    const newsEvent = snapshot.data();
    const payload = {
        notification: {
            title: "New News/Event!",
            body: newsEvent.title,
        },
        webpush: {
            fcm_options: {
                link: `/news-event/${snapshot.id}`,
            },
        },
    };
    const tokensCollection = await db.collection("fcm_tokens").get();
    const tokens = tokensCollection.docs.map((doc) => doc.data().token);
    if (tokens.length > 0) {
        await messaging.sendToDevice(tokens, payload);
    }
});
//# sourceMappingURL=api.js.map