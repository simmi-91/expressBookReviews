const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
    const username = req.body.username || req.query.username || req.params.username;
    const sessionAuth = req.session.authorization;
    const token = sessionAuth?.token;

    if (token && sessionAuth.username === username) {
        next();
    } else {
        return res.status(401).json({ message: `User: '${username}' is not logged in` });
    }
});
 
const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
