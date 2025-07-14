const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_for_dev";

let users = [{ username: 'bob', password: 'passot' }];

const isValid = (username)=>{ //returns boolean
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/; // letters, numbers, underscores, 3-20 chars
  return usernameRegex.test(username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  return users.some(user => user.username === username);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const {username, password } = req.body;
  if ( authenticatedUser(username, password) ) {
    const token = jwt.sign({user:username},JWT_SECRET);
    req.session.authorization = { accessToken: token, username: username };
    console.log( req.session.authorization);
    return res.status(200).json({message: "Logged inn as user:"+username, sessionToken: req.session.authorization.token});
  } else {
    return res.status(401).json({message: "Invalid username and/or password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbnParam = req.params.isbn;
    const {username, review } = req.body;

    if (!isbnParam) {
        return res.status(401).json({message: "Invalid ISBN number"});
    }

    const token = req.session.authorization?.token;
    if (token && req.session.authorization.username === username ) {
        console.log("Token for current user:", token);
      } else {
        return res.status(401).json({message: "User has no access to post review"});
      }

  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
