const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  return (
    users.find(
      (user) => user.username === username && user.password === password,
    ) !== undefined
  );
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    if (!isValid(username)) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    if (!authenticatedUser(username, password)) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    let accessToken = jwt.sign(
      {
        data: username,
      },
      "access",
      { expiresIn: "1h" },
    );

    req.session.authorization = {
      accessToken,
    };

    return res.status(200).json({
      message: "Login successful",
      token: accessToken,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  try {
    const isbn = req.params.isbn;
    const review = req.query.review;

    const username = jwt.verify(
      req.session.authorization.accessToken,
      "access",
    ).data;

    if (!review) {
      return res.status(400).json({
        message: "Review text is required",
      });
    }

    if (!books[isbn]) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    if (!books[isbn].reviews || !Array.isArray(books[isbn].reviews)) {
      books[isbn].reviews = [];
    }

    const existingReview = books[isbn].reviews.find(
      (r) => r && r.username === username,
    );

    if (existingReview) {
      existingReview.review = review;
      return res.status(200).json({
        message: "Review updated successfully",
        review: existingReview,
      });
    } else {
      const newReview = {
        username: username,
        review: review,
      };
      books[isbn].reviews.push(newReview);
      return res.status(201).json({
        message: "Review added successfully",
        review: newReview,
      });
    }
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token",
      });
    }
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  try {
    const isbn = req.params.isbn;

    const username = jwt.verify(
      req.session.authorization.accessToken,
      "access",
    ).data;

    if (!books[isbn]) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    if (!books[isbn].reviews || !Array.isArray(books[isbn].reviews)) {
      return res.status(404).json({
        message: "No reviews found for this book",
      });
    }

    const reviewIndex = books[isbn].reviews.findIndex(
      (review) => review && review.username === username,
    );

    if (reviewIndex === -1) {
      return res.status(404).json({
        message: "You haven't reviewed this book yet",
      });
    }

    books[isbn].reviews.splice(reviewIndex, 1);

    return res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token",
      });
    }
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
