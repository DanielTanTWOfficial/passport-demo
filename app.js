var express                 = require("express"),
    mongoose                = require("mongoose"),
    passport                = require("passport"),
    bodyParser              = require("body-parser"),
    localStrategy           = require("passport-local"),
    passportLocalMongoose   = require("passport-local-mongoose"),
    User                    = require("./models/user");
    
mongoose.connect("mongodb://localhost/authdemo", {useNewUrlParser: true});

var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
// express-session must come before passport
app.use(require("express-session")({
    secret: "the345train2 is coming in hot",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ======================================================================
// ROUTES

app.get('/', function(req, res) {
   res.render('home'); 
});

app.get('/register', function(req, res) {
   res.render('register'); 
});

app.post('/register', function(req, res) {
    // Password is stored as hashed and salted version, not together with username
    User.register(new User({username: req.body.username}), req.body.password, function(err, user) {
        if(err) {
            console.log(err);
            return res.render('register');
        }
        passport.authenticate("local")(req, res, function() {
           res.redirect('/secret'); 
        });
    });
});

app.get('/secret', isLoggedIn, function(req, res) {
   res.render('secret'); 
});

// LOGIN ROUTES
app.get('/login', function(req, res) {
    res.render('login');
});

// login logic + middleware
app.post('/login', passport.authenticate("local", {
    // on successful login
    successRedirect: '/secret',
    // on invalid credentials
    failureRedirect: '/login'
}), function(req, res) {
    
});

// LOGOUT ROUTES
app.get('/logout', function(req, res) {
   req.logout();
   res.redirect('/');
});

// Check if user is logged in, then redirect to next page, otherwise redirect
function isLoggedIn(req, res, next) {
   if(req.isAuthenticated()) {
       return next();
   } 
   res.redirect('/login');
}

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Server Started"); 
});