import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        let user = await User.findOne({
            where: { googleId: profile.id }
        });

        if (user) {
            // Update access token
            user.googleAccessToken = accessToken;
            if (refreshToken) user.googleRefreshToken = refreshToken;
            await user.save();
            return done(null, user);
        }

        // Create new user if doesn't exist
        user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            profilePicture: profile.photos[0].value,
            googleAccessToken: accessToken,
            googleRefreshToken: refreshToken,
            isEmailVerified: true // Since Google has verified the email
        });

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
})); 