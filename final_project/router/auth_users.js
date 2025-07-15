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
  return users.some(user => user.username === username && user.password === password);
}

const isLoggedin = (session, username)=>{ //returns boolean
    const token = session.authorization?.token;
    return token && session.authorization.username === username;
}
  

//only registered users can login
regd_users.post("/login", (req,res) => {
  const {username, password } = req.body;
  if ( authenticatedUser(username, password) ) {
    const token = jwt.sign({user:username},JWT_SECRET);
    req.session.authorization = { token: token, username: username };
    console.log( req.session.authorization);
    return res.status(200).json({message: "Logged inn as user:"+username, token: req.session.authorization.token});
  } else {
    return res.status(401).json({message: "Invalid username and/or password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbnParam = req.params.isbn;
    const { username, review } = req.body;
    if (!isbnParam) {
        return res.status(400).json({ message: "Invalid ISBN number" });
    }
    if (isLoggedin(req.session,username)) {
        let book = books[isbnParam];
        if (book) {
            book.isbn = isbnParam;
            if (!book.reviews) {
                book.reviews = {};
            }
            book.reviews[username] = review;
            return res.status(200).json({ message: "Review added/updated successfully", reviews: book.reviews });
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    } else {
        return res.status(401).json({ message: "User has no access to post review" });
    }
});

// delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbnParam = req.params.isbn;
    const {username } = req.body;
    if (!isbnParam) {
        return res.status(401).json({message: "Invalid ISBN number"});
    }
    if (isLoggedin(req.session,username)) {
        if (books[isbnParam] && books[isbnParam].reviews[username]) {
            delete books[isbnParam].reviews[username];
            return res.status(200).json({ message: `Review by '${username}' on isbn:'${isbnParam}' deleted successfully`, reviews: books[isbnParam].reviews});
        } else {
            return res.status(404).json({ message: "Review not found for this user" });
        }
    } 

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
