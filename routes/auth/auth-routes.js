// const express = require("express");
// const jwt = require("jsonwebtoken");
// const {
//   registerUser,
//   loginUser,
//   logoutUser,
// } = require("../../controllers/auth/auth-controller");

// const router = express.Router();

// // Middleware to verify the JWT token
// const authMiddleware = (req, res, next) => {
//   const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from Authorization header

//   if (!token) {
//     return res.status(401).json({ success: false, message: "No token provided" });
//   }

//   // Verify the token
//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ success: false, message: "Invalid or expired token" });
//     }

//     // If the token is valid, store the decoded user data in req.user
//     req.user = decoded; // You can add more user info in the token
//     next(); // Proceed to the next middleware or route handler
//   });
// };

// // Routes
// router.post("/register", registerUser);
// router.post("/login", loginUser);
// router.post("/logout", logoutUser);

// // Check auth route using token validation
// router.get("/check-auth", authMiddleware, (req, res) => {
//   const user = req.user; // Extracted user info from token

//   res.status(200).json({
//     success: true,
//     message: "Authenticated user!",
//     user,
//   });
// });

// module.exports = router;










const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
} = require("../../controllers/auth/auth-controller");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/check-auth", authMiddleware, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    user,
  });
});

module.exports = router;