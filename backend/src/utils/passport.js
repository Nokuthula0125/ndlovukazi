const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { Strategy: GitHubStrategy } = require('passport-github2');
const prisma = require('./prisma');

// JWT
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
}, async (payload, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    return done(null, user || false);
  } catch (e) { return done(e, false); }
}));

// Google
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id') {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await prisma.user.findFirst({ where: { provider: 'google', providerId: profile.id } });
      if (!user) {
        user = await prisma.user.findUnique({ where: { email: profile.emails[0].value } });
        if (user) {
          user = await prisma.user.update({ where: { id: user.id }, data: { provider: 'google', providerId: profile.id } });
        } else {
          user = await prisma.user.create({ data: {
            email: profile.emails[0].value,
            name: profile.displayName,
            avatarUrl: profile.photos?.[0]?.value,
            provider: 'google',
            providerId: profile.id,
            emailVerified: true,
          }});
        }
      }
      return done(null, user);
    } catch (e) { return done(e, false); }
  }));
}

// GitHub
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_ID !== 'your_github_client_id') {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
    scope: ['user:email'],
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      let user = await prisma.user.findFirst({ where: { provider: 'github', providerId: String(profile.id) } });
      if (!user && email) {
        user = await prisma.user.findUnique({ where: { email } });
        if (user) {
          user = await prisma.user.update({ where: { id: user.id }, data: { provider: 'github', providerId: String(profile.id) } });
        } else {
          user = await prisma.user.create({ data: {
            email: email || `github_${profile.id}@placeholder.com`,
            name: profile.displayName || profile.username,
            avatarUrl: profile.photos?.[0]?.value,
            provider: 'github',
            providerId: String(profile.id),
            emailVerified: true,
          }});
        }
      }
      return done(null, user);
    } catch (e) { return done(e, false); }
  }));
}
