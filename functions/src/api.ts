import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";

admin.initializeApp();
const bucket = admin.storage().bucket("piwc-asokwa-site.firebasestorage.app");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

let transporter: nodemailer.Transporter | undefined;

try {
    const gmailEmail = functions.config().gmail?.email;
    const gmailPassword = functions.config().gmail?.password;

    if (gmailEmail && gmailPassword) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: gmailEmail,
                pass: gmailPassword
            }
        });
        console.log("Nodemailer transporter created successfully.");
    } else {
        console.error("Gmail configuration is missing. Ensure functions:config:set gmail.email and gmail.password are set.");
    }
} catch (error) {
    console.error("Error creating Nodemailer transporter:", error);
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
        version: "v4" as const,
        action: "write" as const,
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        contentType: contentType,
    };

    try {
        const [uploadUrl] = await file.getSignedUrl(options);
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueFileName}`;
        return res.status(200).json({ uploadUrl, publicUrl });
    } catch (error) {
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
    } catch (error: any) {
        console.error("Failed to delete image:", error);
        if (error.code === 404) {
             return res.status(200).json({ message: "Image already deleted or not found." });
        }
        return res.status(500).json({ message: "Image could not be deleted." });
    }
});

app.post("/send-email", async (req, res) => {
    if (!transporter) {
        console.error("Email transporter not initialized. Check configuration and function logs.");
        return res.status(500).json({ error: "Email service is not configured on the server." });
    }

    const { name, email, phone, message, subject } = req.body;

    if (!name || !email || !message || !subject) {
        return res.status(400).json({ error: "Missing required fields: name, email, message, subject" });
    }

    const mailOptions = {
        from: `"${name}" <${email}>`,
        to: "obrempong.kow@gmail.com",
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
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ error: "Failed to send email" });
    }
});

exports.api = functions.runWith({ memory: "256MB" }).https.onRequest(app);
