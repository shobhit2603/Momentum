import { Server } from "socket.io";
import config from "./config/config.js";
import * as utils from "./utils/utils.js";

let ioInstance = null;

const clientUrl = config.CLIENT_URL ? config.CLIENT_URL.replace(/\/$/, "") : "";

export const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || origin === clientUrl || process.env.NODE_ENV === "development") {
          callback(null, origin || true);
        } else {
          callback(null, true);
        }
      },
      credentials: true,
    },
  });

  ioInstance.use((socket, next) => {
    const authHeader = socket.handshake.headers?.authorization;
    const token = socket.handshake.auth?.token || authHeader?.split(" ")[1];
    const decoded = utils.verifyJWT(token);
    if (!decoded) {
      return next(new Error("Unauthorized"));
    }
    socket.user = decoded;
    return next();
  });

  ioInstance.on("connection", (socket) => {
    const userId = socket.user?.id;
    if (userId) {
      socket.join(userId.toString());
    }
  });

  return ioInstance;
};

export const getIO = () => ioInstance;
