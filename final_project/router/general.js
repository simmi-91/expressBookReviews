const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //const username = req.body.username;
  //const password = req.body.password;
  const {username, password } = req.body;

  if ( !username || !password ) {
    return res.status(401).json({message: "Username and/or password has not been provided"});
  }

  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(200).json({message: "user:" + username + " allready exists"});
  } else {
    if ( isValid(username) ) {
        users.push({ username: username, password: password });
        return res.status(200).json({message: "Added user:" + username});
    } else {
        return res.status(401).json({message: "Username is not valid"});
    }
  } 

});

// Get the book list available in the shop
public_users.get('/',function (req, res) {

    const allBooks = [];  
    for (let key in books) {
        allBooks.push({ isbn: key, ...books[key] });
    }  

    if (allBooks.length > 0) {
      return res.status(200).json(allBooks);
    } else {
      return res.status(404).json({ message: `No books found.` });
    }

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {

    const isbnParam = req.params.isbn;
    const matchingBooks = [];
  
    for (let key in books) {
      if (key === isbnParam) {
        matchingBooks.push({ isbn: key, ...books[key] });
      }
    }
  
    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      return res.status(404).json({ message: `No books found with isbn '${isbnParam}'.` });
    }

 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {

    const authorParam = req.params.author.toLowerCase();
    const matchingBooks = [];
  
    for (let key in books) {
      if (books[key].author.toLowerCase() === authorParam) {
        matchingBooks.push({ isbn: key, ...books[key] });
      }
    }
  
    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      return res.status(404).json({ message: `No books found by author '${authorParam}'.` });
    }

});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {

    const titleParam = req.params.title.toLowerCase();
    const matchingBooks = [];
  
    for (let key in books) {
      if (books[key].title.toLowerCase() === titleParam) {
        matchingBooks.push({ isbn: key, ...books[key] });
      }
    }
  
    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      return res.status(404).json({ message: `No books found with title '${titleParam}'.` });
    }

});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {

    const isbnParam = req.params.isbn;
    const reviews = [];
  
    for (let key in books) {
        const review = books[key].review;
      if (key === isbnParam) {
        if ( review ) {
            reviews.push( review );
        } else {
            return res.status(200).json({ message: `No reviews have been made for book with with isbn '${isbnParam}'.` });
        }
        
      }
    }
  
    if (reviews.length > 0) {
      return res.status(200).json(reviews);
    } else {
      return res.status(404).json({ message: `No reviews found for book with with isbn '${isbnParam}'.` });
    }

});

module.exports.general = public_users;
