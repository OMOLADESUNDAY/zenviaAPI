import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../model/User.js";

// Serialize/deserialize user (for sessions, required by Passport)
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ oauthId: profile.id, provider: "google" });
    if (!user) {
      user = await User.create({
        oauthId: profile.id,
        provider: "google",
        name: profile.displayName,
        email: profile.emails?.[0]?.value || "",
        isVerified: true,
        role: "user",
      });
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

// GitHub OAuth
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "/auth/github/callback",
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ oauthId: profile.id, provider: "github" });
    if (!user) {
      user = await User.create({
        oauthId: profile.id,
        provider: "github",
        name: profile.username,
        email: profile.emails?.[0]?.value || "",
        isVerified: true,
        role: "user",
      });
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

export default passport;
