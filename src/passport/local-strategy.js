import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import UserManager from '../dao/mongoDB/UserManager.js';
import Auth0Strategy from 'passport-auth0';

const userDao = new UserManager();

const strategyOptions = {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
};

/* ----------------------------- lógica registro ---------------------------- */
const register = async (req, email, password, done) => {
    try {
        // const { first_name, last_name,... } = req.body
        /* const user = await userDao.getByEmail(email);
        if (user) return done(null, false); */
        const newUser = await userDao.saveUser(req.body);
        return done(null, newUser);
    } catch (error) {
        console.log(error);
    }
};


/* ------------------------------ lógica login ------------------------------ */
const login = async (req, email, password, done) => {
    try {
        const user = { email, password };
        console.log('USER', user);
        const userLogin = await userDao.loginUser(user);
        console.log('LOGIN', userLogin);
        if (!userLogin) return done(null, false, { message: 'User not found' });
        return done(null, userLogin);
    } catch (error) {
        console.log(error);
    }
};

const strategy = new Auth0Strategy(
    {
      domain: process.env.AUTH0_DOMAIN,
      clientID: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      callbackURL: process.env.AUTH0_CALLBACK_URL
    },
    async function(accessToken, refreshToken, extraParams, profile, done) {
      const user = {
        nombre: profile._json.name.split(' ')[0],
        apellido: profile._json.name.split(' ')[1],
        email: profile._json.nickname,
        password: '',
        github: true,
      }
      userDao.saveUser(user);
      return done(null, profile);
    }
);


/* ------------------------------- strategies ------------------------------- */
const registerStrategy = new LocalStrategy(strategyOptions, register);
const loginStrategy = new LocalStrategy(strategyOptions, login);
/* ----------------------------- inicializacion ----------------------------- */
passport.use('login', loginStrategy);
passport.use('register', registerStrategy);

passport.use(strategy);

/* ------------------------- serialize y deserialize ------------------------ */
//guarda al usuario en req.session.passport
//req.session.passport.user --> id del usuario
passport.serializeUser((user, done) => {
    done(null, user)
});

passport.deserializeUser(async (user, done) => {
    const checkuser = await userDao.getUserById(user.id);
    return done(null, checkuser);
});
