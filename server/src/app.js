import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./config/config.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const app = express();

const clientUrl = config.CLIENT_URL ? config.CLIENT_URL.replace(/\/$/, "") : "";

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(passport.initialize());

app.get("/", (req, res) => {
  res.send("Momentum backend is running...");
});

// Google OAuth configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      const user = {
        email: profile.emails?.[0]?.value,
        name: profile.displayName,
        profilePicture: profile.photos?.[0]?.value,
      };
      return done(null, user);
    },
  ),
);

import userRouter from "./routes/user.routes.js";
import taskRouter from "./routes/task.routes.js";
import reviewRouter from "./routes/review.routes.js";

// Routes
app.use("/api/users", userRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/reviews", reviewRouter);

export default app;
