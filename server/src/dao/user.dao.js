import User from "../models/user.model.js";

export async function getUser(email) {
  return await User.findOne({ email });
}

export async function createNewUser(name, email) {
  return await User.create({ name, email });
}

export async function getUserById(id) {
  return await User.findById(id).populate("friends", "name email profilePicture streak");
}

export async function updateUserLastActive(id) {
  return await User.findByIdAndUpdate(id, { lastActive: new Date() }, { new: true });
}

export async function searchUsers(query, excludeId) {
  return await User.find({
    name: { $regex: query, $options: "i" },
    _id: { $ne: excludeId },
  }).select("name email profilePicture");
}

export async function addFriendRequest(targetId, requesterId) {
  const targetUser = await User.findById(targetId);
  if (!targetUser) return null;
  
  if (targetUser.friendRequests.includes(requesterId) || targetUser.friends.includes(requesterId)) {
    return false; // Already sent or friends
  }
  
  targetUser.friendRequests.push(requesterId);
  await targetUser.save();
  return true;
}

export async function acceptFriendRequest(userId, requesterId) {
  const currentUser = await User.findById(userId);
  const requesterUser = await User.findById(requesterId);

  if (!currentUser || !requesterUser) return false;
  if (!currentUser.friendRequests.includes(requesterId)) return false;

  currentUser.friends.push(requesterId);
  currentUser.friendRequests = currentUser.friendRequests.filter(id => id.toString() !== requesterId);
  
  if (!requesterUser.friends.includes(userId)) {
    requesterUser.friends.push(userId);
  }

  await currentUser.save();
  await requesterUser.save();
  return true;
}

export async function getFriends(userId) {
  const user = await User.findById(userId).populate("friends", "name email profilePicture streak lastActive");
  return user ? user.friends : [];
}

export async function updateUserProfilePicture(id, profilePicture) {
  return await User.findByIdAndUpdate(id, { profilePicture }, { new: true });
}
