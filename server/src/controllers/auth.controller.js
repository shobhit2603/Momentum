import * as userDao from "../dao/user.dao.js";
import * as utils from "../utils/utils.js";
import config from "../config/config.js";
import User from "../models/user.model.js";

// googleAuthController
export const googleAuthController = async (req, res) => {
  try {
    // Extract data either from passport (req.user) or frontend request (req.body)
    const email = req.user?.email || req.body?.email;
    const name = req.user?.name || req.body?.name;
    const profilePicture = req.user?.profilePicture || req.body?.profilePicture;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: "Email and name are required for authentication.",
      });
    }

    // Check if user exists
    let user = await userDao.getUser(email);

    if (!user) {
      // Create new user if not found
      user = await userDao.createNewUser(name, email);
    }

    // Update profile picture if provided and it has changed
    if (profilePicture && user.profilePicture !== profilePicture) {
      await User.findByIdAndUpdate(user._id, { profilePicture });
      user.profilePicture = profilePicture;
    }

    // Generate JWT token
    const token = utils.generateJWT({
      id: user._id,
      email: user.email,
    });

    // Set secure cookie. Force production rules if Vercel is in the CLIENT_URL
    const isProduction = config.NODE_ENV === "production" || (config.CLIENT_URL && config.CLIENT_URL.includes("vercel.app"));
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    };

    res.cookie("token", token, cookieOptions);

    // Redirect the user back to the frontend application with the token in the URL as a fallback
    const redirectUrl = new URL(config.CLIENT_URL);
    redirectUrl.searchParams.set("token", token);
    return res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("Error in googleAuthController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication.",
    });
  }
};

// getCurrentUser
export const getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. No token provided.",
      });
    }

    // Verify token
    const decoded = utils.verifyJWT(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Invalid or expired token.",
      });
    }

    // Fetch latest user data from DB
    const user = await userDao.getUser(decoded.email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching current user.",
    });
  }
};

// logoutController
export const logoutController = async (req, res) => {
  try {
    const isProduction = config.NODE_ENV === "production" || (config.CLIENT_URL && config.CLIENT_URL.includes("vercel.app"));
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    };

    res.clearCookie("token", cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("Error in logoutController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during logout.",
    });
  }
};