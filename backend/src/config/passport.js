const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
      scope: ['profile', 'email'], // Explicitly set scope
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('🔐 Google OAuth Profile:', {
          id: profile.id,
          email: profile.emails[0]?.value,
          name: profile.displayName
        });

        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          console.log('✅ Existing Google user found:', user.email);
          return done(null, user);
        }

        // Check if user exists with same email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          console.log('🔗 Linking Google account to existing user:', user.email);
          // Link Google account to existing user
          user.googleId = profile.id;
          user.profileImage = user.profileImage || profile.photos[0]?.value;
          await user.save();
          return done(null, user);
        }

        // Create new user
        console.log('👤 Creating new Google OAuth user');
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          profileImage: profile.photos[0]?.value,
          role: 'customer', // Explicitly set role to 'customer' for new Google users
        });

        console.log('✅ New Google user created:', {
          id: user._id,
          email: user.email,
          role: user.role
        });
        
        done(null, user);
      } catch (error) {
        console.error('❌ Google OAuth error:', error);
        done(error, null);
      }
    }
  )
);

module.exports = passport;