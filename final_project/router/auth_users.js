const express = require('express');
const session = require('express-session')
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const validReview = (isbn, username) => {
  return books[isbn].reviews[username] && books[isbn].reviews
};

const isValid = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length > 0;
};

const authenticatedUser = (username, password) => {
  let validusers = users.filter(user => {
    return user.username === username && user.password === password;
  });
  return validusers.length > 0;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }

});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  // use query for posting the review
  const review = req.query.reviewPost
  // get user from the stored session
  const currentUser = req.session.authorization['username'];
  
  if (isbn && review) {
    
    // any attempt from the same user to post for the same book will result in overwrite.
    if (validReview(isbn, currentUser)) {
      books[isbn].reviews.reviewStatement = review;
      return res.status(200).send(`Book review by '${currentUser}' was updated!`)

    } else {
      books[isbn].reviews[currentUser] = {
        reviewStatement: review,
        timeStamp: new Date()
      };

      return res.status(200).send(`Book review by '${currentUser}' was saved!`)

    }
  };
});

regd_users.delete("/auth/review/:isbn", (req, res) => {

  const isbn = req.params.isbn;
  // get user from the stored session
  const currentUser = req.session.authorization['username'];
  // filter the book reviews that belong to the active user
  const currentUserReview = books[isbn].reviews[currentUser];
  
  if (validReview(isbn, currentUser) && currentUserReview) {
  
    delete currentUserReview;
    return res.status(200).send(`Review posted by '${currentUser}' for '${books[isbn].title}' was deleted`)
  } else {
    return res.status(404).send(`No book review was found for ${currentUser}`)
  };

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
