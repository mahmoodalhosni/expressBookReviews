const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  // Log the entire req.body object
  // console.log(req.body); 
  
   const username = req.body.username;
   const password = req.body.password;
   if (username && password) {
     if (!isValid(username)) {
       users.push({ "username": username, "password": password });
       return res.status(200).json({ message: "User successfully registered. Now you can login" });      
      } else {
       return res.status(404).json({ message: "User already exists!" });
     }
   } else {
    return res.status(300).json({ message: "username or password is missing"}) 
   }
   return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // send JSON response with the formatted friends data
  res.send(JSON.stringify(books, null, 4))
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
   // Retrieve the isbn when available for a book
   const isbnInput = req.params.isbn;
  //  Need to check if ISPN is part of the parameters in the database and that it is a valid value for any of the value objects.
   if (books[isbnInput]) {
    res.send(books[isbnInput]);
   } else {
    return res.status(400).json({message: "No ISPN record found on the database"})
   };
  

 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const targetAuthor = req.params.author
  
  // obtain all the keys for the 'books' object
  const bookKeys = Object.keys(books);
  
  // Loop through the object to find the author's books and return the result.
  if(targetAuthor) {

    let filteredBooks = bookKeys.filter(key => books[key].author === targetAuthor);
      if (filteredBooks.length > 0) {
        // Recreate the new result as an object
        const returnedObject = filteredBooks.reduce((obj, key) =>{
          obj[key] = books[key];
          return obj;
        }, {});

      res.send(returnedObject)
        // if 
      } else {

        return res.status(300).json({message: "No results found"})
      }

  } else {

  return res.status(400).json({message: "No search query received"});
  };
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const targetTitle = req.params.title
  
  // obtain all the keys for the 'books' object
  const bookKeys = Object.keys(books);
  
  // Loop through the object to find the author's books and return the result.
  if(targetTitle) {

    let filteredBooks = bookKeys.filter(key => books[key].title === targetTitle);
      if (filteredBooks.length > 0) {
        // Recreate the new result as an object
        const returnedObject = filteredBooks.reduce((obj, key) =>{
          obj[key] = books[key];
          return obj;
        }, {});

      res.send(returnedObject)
        // if 
      } else {

        return res.status(300).json({message: "No results found"})
      }

  } else {

  return res.status(400).json({message: "No search query received"});
  };
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
 // Retrieve the isbn when available for a book
 const isbnInput = req.params.isbn;
 //  Need to check if ISPN is part of the parameters in the database and that it is a valid value for any of the value objects.
  if (books[isbnInput]) {
   res.send(books[isbnInput].reviews);
  } else {
   return res.status(400).json({message: "No ISPN record found on the database"})
  };
});

module.exports.general = public_users;
