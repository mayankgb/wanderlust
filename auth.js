const passport = require("passport");
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const User = require('./models/user.js')

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET =process.env.GOOGLE_CLIENT_SECRET

passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
   
    User.findOne({ googleId: profile.id })
    .then((user)=>{
        if (!user) {
            // Create a new user in the database
            const newUser = new User({ googleId: profile.id, displayName: profile.displayName,email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null,username:profile.displayName});
            newUser.save().then(()=>{
                return done(null, newUser)
            }).catch((saveErr)=>{
                return done(saveErr,null);
            })
          } else {
            // User already exists, simply log them in
            return done(null, user);
          }
    })
    .catch((err)=>{
        if (err) {
            return done(err);
          }
    })
    
  }
));
passport.serializeUser(function(user,done){
    done(null,user);
});

passport.deserializeUser(function(user,done){
    done(null,user);
})
