import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import UserController from '../controllers/mongoDB/controllers.user.js';
import Auth0Strategy from 'passport-auth0';
import config from '../utils/config.js';

const userDao = new UserController();

const strategyOptions = {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
};

/* ----------------------------- lógica registro ---------------------------- */
const register = async (req, email, password, done) => {
    try {
        const { nombre, apellido, email, password, password2 } = req.body;
        let newUser = {};
        if (password.length < 4) {
            newUser = {ok: false, error: 'La contraseña debe contener al menos 4 caracteres'};
            return done(null, newUser);
        }
        if (password !== password2) {
            newUser = {ok: false, error: 'Las contraseñas no coinciden'};
            return done(null, newUser);
        }
        newUser = await userDao.saveUser({
            nombre,
            apellido,
            email,
            password
        });
        return done(null, newUser);
    } catch (error) {
        console.log(error);
        return done(error);
    }
};



/* ------------------------------ lógica login ------------------------------ */
const login = async (req, email, password, done) => {
    try {
        const user = { email, password };
        const userLogin = await userDao.loginUser(user);
        if (!userLogin.ok) return done(null, userLogin);
        return done(null, userLogin);
    } catch (error) {
        console.log(error);
    }
};
const strategy = new Auth0Strategy(
    {
      domain: config.AUTH0_DOMAIN,
      clientID: config.AUTH0_CLIENT_ID,
      clientSecret: config.AUTH0_CLIENT_SECRET,
      callbackURL: config.AUTH0_CALLBACK_URL
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
