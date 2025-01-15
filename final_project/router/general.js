const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
// const axios = require('axios').default;

public_users.post("/register", (req, res) => {
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
    return res.status(500).json({ message: "Unable to register user." });
  }

});


// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {

    res.send(JSON.stringify(books, null, 4)); //await is unecessary here.

  } catch (error) {
    res.send(500).json({ message: "Unable to fetch book listing.\nError: " + error })
  };
});


// Get book details based on the ISBN
function getBookDetailsFromISBN(isbn) {
  return new Promise((resolve, reject) => {
    //  Check if ISPN is part of the parameters in the database and that it is a valid value for any of the value objects.
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("No ISPN record found on the database")
    };
  })
}
public_users.get('/isbn/:isbn', async function (req, res) {

  try {
    // Retrieve the isbn when available for a book
    const isbnInput = req.params.isbn;
    const bookDetails = await getBookDetailsFromISBN(isbnInput);

    res.send(bookDetails)

  } catch (error) {
    res.send(500).json({ message: "Unable to find the requested ISBN.\nError: " + error })
  };
});


// Get book details based on author
function getBookDetailsFromAuthor(author) {
  return new Promise((resolve, reject) => {
    if (author) {
      // obtain all the keys for the 'books' object
      let bookKeys = Object.keys(books);
      let filteredBooks = bookKeys.filter(key => books[key].author === author);
      if (filteredBooks.length > 0) {
        // Recreate the new result as an object
        const returnedObject = filteredBooks.reduce((obj, key) => {
          obj[key] = books[key];
          return (obj);
        }, {});

        resolve(returnedObject);
      }
    } else {
      reject("Error fetching book details using Author")
    };
  })
};

public_users.get('/author/:author', async function (req, res) {
  try {
    const targetAuthor = req.params.author
    // Loop through the object to find the author's books and return the result.
    const bookDetails = await getBookDetailsFromAuthor(targetAuthor)

    res.send(bookDetails);

  } catch (error) {
    res.send(500).json({ message: "Unable to fetch results.\nError: " + error })
  };
});



// Get all books based on title
function getBookDetailsFromTitle(title) {
  return new Promise((resolve, reject) => {
    if (title) {
      // obtain all the keys for the 'books' object
      let bookKeys = Object.keys(books);
      let filteredBooks = bookKeys.filter(key => books[key].title === title);
      if (filteredBooks.length > 0) {
        // Recreate the new result as an object
        const returnedObject = filteredBooks.reduce((obj, key) => {
          obj[key] = books[key];
          return (obj);
        }, {});

        resolve(returnedObject);
      }
    } else {
      reject("Error fetching book details using Author")
    };
  })
};

public_users.get('/title/:title', async function (req, res) {
  try {
    const targetTitle = req.params.title
    // Loop through the object to find the author's books and return the result.
    const bookDetails = await getBookDetailsFromTitle(targetTitle)

    res.send(bookDetails)

  } catch (error) {
    res.send(500).json({ message: "Unable to fetch results.\nError: " + error })
  };

});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  // Retrieve the isbn when available for a book
  const isbnInput = req.params.isbn;
  //  Need to check if ISPN is part of the parameters in the database and that it is a valid value for any of the value objects.
  if (books[isbnInput]) {
    res.send(books[isbnInput].reviews);
  } else {
    return res.status(400).json({ message: "No ISPN record found on the database" })
  };
});

module.exports.general = public_users;
