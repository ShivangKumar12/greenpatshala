// server/middleware/passport.ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export function setupGoogleAuth() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL!,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('✅ Google OAuth Profile received:', profile.displayName);
          
          const email = profile.emails?.[0]?.value;
          
          if (!email) {
            return done(new Error('No email found in Google profile'), undefined);
          }

          // Check if user exists
          const existingUsers = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          let user = existingUsers[0];

          if (user) {
            console.log('✅ Existing user found:', email);
            
            // Update Google ID if not set
            if (!user.google_id) {
              const updated = await db
                .update(users)
                .set({ 
                  google_id: profile.id,
                  is_verified: true, // Auto-verify Google users
                  avatar: profile.photos?.[0]?.value || user.avatar,
                  updated_at: new Date(),
                })
                .where(eq(users.id, user.id))
                .execute();
              
              // Fetch updated user
              const updatedUser = await db
                .select()
                .from(users)
                .where(eq(users.id, user.id))
                .limit(1);
              
              user = updatedUser[0];
            }
          } else {
            console.log('✅ Creating new user:', email);
            
            // Create new user
            const newUsers = await db
              .insert(users)
              .values({
                email,
                name: profile.displayName || 'Google User',
                google_id: profile.id,
                avatar: profile.photos?.[0]?.value,
                role: 'student',
                is_verified: true, // Auto-verify Google users
                password: null, // No password for Google users
              })
              .$returningId();

            // Fetch the created user
            const createdUser = await db
              .select()
              .from(users)
              .where(eq(users.id, newUsers[0].id))
              .limit(1);

            user = createdUser[0];
          }

          console.log('✅ OAuth user ready:', user.name);
          return done(null, user);
        } catch (error) {
          console.error('❌ Google OAuth error:', error);
          return done(error as Error, undefined);
        }
      }
    )
  );

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      
      done(null, result[0] || null);
    } catch (error) {
      done(error, null);
    }
  });
}
