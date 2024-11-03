const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const jwt = require("jsonwebtoken");
const emailjs = require("emailjs-com");
const { jsPDF } = require("jspdf");
const cloudinary = require("./cloudinaryConfig");

// Import routes
const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");
const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const commonFeatureRouter = require("./routes/common/feature-routes");
const DesignSubmission = require("./models/DesignSubmission");

// Create a database connection
mongoose
  .connect("mongodb+srv://aniketmorepersonal:CS3bSl2JGYSI4i29@cluster0.lxa8x.mongodb.net/")
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173", // Allow your frontend origin
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true, // Allow credentials
  })
);

app.use(cookieParser());
app.use(express.json());

// Middleware to verify the JWT token
const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    // Store decoded user data in req.user
    req.user = decoded;
    next();
  });
};

// Configure Multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products", // Folder name in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "gif"],
  },
});

const imageParser = multer({ storage: storage });

// Image upload route
app.post('/api/admin/products/upload-image', imageParser.single('my_file'), (req, res) => {
  if (req.file) {
    return res.json({
      success: true,
      result: {
        url: req.file.path, // URL of the uploaded image
      },
    });
  } else {
    return res.status(400).json({ success: false, message: 'Image upload failed' });
  }
});

// Route to handle design submission
app.post('/api/submit-design', async (req, res) => {
  const { title, name, email, phone, margin, design } = req.body;

  const newSubmission = new DesignSubmission({
    title,
    design,
    name,
    email,
    phone,
    margin,
  });

  try {
    const savedSubmission = await newSubmission.save();
    return res.status(201).json({ success: true, data: savedSubmission });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to save design submission' });
  }
});

// Route to fetch all design submissions
app.get('/api/design-submissions', async (req, res) => {
  try {
    const submissions = await DesignSubmission.find();
    return res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to fetch design submissions' });
  }
});

// Route to delete a design submission by ID
app.delete('/api/design-submissions/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedSubmission = await DesignSubmission.findByIdAndDelete(id);

    if (!deletedSubmission) {
      return res.status(404).json({ success: false, message: 'Design submission not found' });
    }

    return res.status(200).json({ success: true, message: 'Design submission deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to delete design submission' });
  }
});

// Configure multer for PDF uploads
const pdfStorage = multer.memoryStorage(); // Store files in memory
const uploadPDF = multer({ storage: pdfStorage }); // Create an upload middleware

// Route to upload PDF, store it in Cloudinary, and return the link
app.post("/api/upload-pdf", uploadPDF.single("file"), async (req, res) => {
  const file = req.file;

  // Ensure the file exists
  if (!file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  try {
    // Upload PDF to Cloudinary
    const uploadResult = await cloudinary.uploader.upload_stream(
      {
        resource_type: "raw", // Indicate that this is a raw file (PDF)
        folder: "pdfs", // Folder name in Cloudinary
      },
      (error, result) => {
        if (error) {
          return res.status(500).json({ success: false, message: "Failed to upload PDF to Cloudinary" });
        }
        // Return the URL of the uploaded PDF
        return res.status(200).json({ success: true, pdfLink: result.secure_url });
      }
    );

    // Use a Buffer to convert the file data
    const buffer = Buffer.from(file.buffer);
    uploadResult.end(buffer); // End the upload stream with the buffer
  } catch (error) {
    console.error("Error uploading PDF:", error);
    return res.status(500).json({ success: false, message: "Error uploading PDF: " + error.message });
  }
});

// Route to generate PDF
app.post("/api/generate-pdf", async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: "Title and content are required" });
  }

  try {
    // Generate PDF using jsPDF
    const doc = new jsPDF();
    doc.text(title, 10, 10);
    doc.text(content, 10, 20);

    // Convert PDF to binary string
    const pdfData = doc.output("arraybuffer"); // Use arraybuffer for better compatibility

    // Upload PDF to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "pdfs",
        resource_type: "raw",
      },
      (error, result) => {
        if (error) {
          return res.status(500).json({ success: false, message: "Failed to upload PDF to Cloudinary" });
        }
        return res.status(200).json({ success: true, url: result.secure_url });
      }
    );

    const buffer = Buffer.from(pdfData);
    uploadStream.end(buffer); // End the upload stream with the buffer
  } catch (error) {
    console.error("Error generating PDF:", error);
    return res.status(500).json({ success: false, message: "Error generating PDF: " + error.message });
  }
});

// Existing routes
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);
app.use("/api/common/feature", commonFeatureRouter);

// Authenticated route to check token
app.get('/api/auth/check-auth', authMiddleware, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    user,
  });
});

// Start the server
app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));
