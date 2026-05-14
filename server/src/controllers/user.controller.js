import * as userDao from "../dao/user.dao.js";
import * as utils from "../utils/utils.js";
import config from "../config/config.js";

// --- Auth Methods ---
export const googleAuthController = async (req, res) => {
  try {
    const email = req.user?.email || req.body?.email;
    const name = req.user?.name || req.body?.name;
    const profilePicture = req.user?.profilePicture || req.body?.profilePicture;

    if (!email || !name) {
      // Redirect to frontend with an error param instead of JSON
      return res.redirect(`${config.CLIENT_URL}?error=MissingData`);
    }

    let user = await userDao.getUser(email);

    if (!user) {
      user = await userDao.createNewUser(name, email);
    }

    if (profilePicture && user.profilePicture !== profilePicture) {
      user = await userDao.updateUserProfilePicture(user._id, profilePicture);
    }

    const token = utils.generateJWT({ id: user._id, email: user.email });

    const isProduction =
      config.NODE_ENV === "production" ||
      (config.CLIENT_URL && config.CLIENT_URL.includes("vercel.app"));
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    };

    res.cookie("token", token, cookieOptions);

    // Clean redirect to dashboard or home
    return res.redirect(`${config.CLIENT_URL}/`);
  } catch (error) {
    console.error("Error in googleAuthController:", error);
    return res.redirect(`${config.CLIENT_URL}/login`);
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized. No token provided." });
    }

    const decoded = utils.verifyJWT(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: "Unauthorized. Invalid or expired token." });
    }

    const user = await userDao.getUser(decoded.email);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
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
    return res.status(500).json({ success: false, message: "Internal server error while fetching current user." });
  }
};

export const logoutController = async (req, res) => {
  try {
    const isProduction = config.NODE_ENV === "production" || (config.CLIENT_URL && config.CLIENT_URL.includes("vercel.app"));
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    };

    res.clearCookie("token", cookieOptions);
    return res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    console.error("Error in logoutController:", error);
    return res.status(500).json({ success: false, message: "Internal server error during logout." });
  }
};

// --- User Profile & Friends Methods ---

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userDao.getUserById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await userDao.updateUserLastActive(userId);
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ success: false, message: "Server error fetching profile" });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: "Query required" });

    const users = await userDao.searchUsers(query, req.user.id);
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error in searchUsers:", error);
    res.status(500).json({ success: false, message: "Server error searching users" });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ success: false, message: "Cannot send request to yourself" });
    }

    const success = await userDao.addFriendRequest(targetUserId, currentUserId);
    if (success === null) return res.status(404).json({ success: false, message: "User not found" });
    if (success === false) return res.status(400).json({ success: false, message: "Request already sent or already friends" });

    res.status(200).json({ success: true, message: "Friend request sent" });
  } catch (error) {
    console.error("Error in sendFriendRequest:", error);
    res.status(500).json({ success: false, message: "Server error sending friend request" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { requesterId } = req.body;
    const currentUserId = req.user.id;

    const success = await userDao.acceptFriendRequest(currentUserId, requesterId);
    if (!success) {
      return res.status(400).json({ success: false, message: "No friend request found or user not found" });
    }

    res.status(200).json({ success: true, message: "Friend request accepted" });
  } catch (error) {
    console.error("Error in acceptFriendRequest:", error);
    res.status(500).json({ success: false, message: "Server error accepting friend request" });
  }
};

export const getFriends = async (req, res) => {
  try {
    const friends = await userDao.getFriends(req.user.id);
    res.status(200).json({ success: true, friends });
  } catch (error) {
    console.error("Error in getFriends:", error);
    res.status(500).json({ success: false, message: "Server error fetching friends" });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const requests = await userDao.getPendingRequests(req.user.id);
    res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error("Error in getPendingRequests:", error);
    res.status(500).json({ success: false, message: "Server error fetching pending requests" });
  }
};
