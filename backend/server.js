import express, { response } from "express";
import mysql from "mysql2";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import "dotenv/config";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173", // Specify the origin of your frontend app
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "signup",
});

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ error: "You are not authenticated" });
  } else {
    jwt.verify(token, "jwt-key", (err, decoded) => {
      if (err) {
        return res.json({ error: "Token is invalid" });
      } else {
        req.id = decoded.id;
        next(); // Continue to the next middleware
      }
    });
  }
};

app.get("/", verifyUser, (req, res) => {
  return res.json({ message: "success", id: req.id });
});

app.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  const checkQuery = "SELECT * FROM users WHERE email = ?";
  // checkin existing user
  db.query(checkQuery, [email], (err, data) => {
    if (err) return res.json(err);

    if (data.length) return res.status(409).json("Email Already registered");

    const queryInsert =
      "INSERT INTO users (`username`, `email`, `password`) VALUES (?)";

    bcrypt.hash(password, 10, (err, hash) => {
      // Hash the raw password
      if (err) {
        return res.status(500).json("Error hashing the password");
      }

      const values = [username, email, hash];

      db.query(queryInsert, [values], (err, results) => {
        if (err) {
          return res.status(500).json("Error inserting the user data");
        }

        return res.status(201).json({ message: "User created successfully" });
      });
    });
  });
});

app.post("/login", (req, res) => {
  const loginQuery = "SELECT * FROM users WHERE username = ?";

  db.query(loginQuery, [req.body.username], (queryError, data) => {
    if (queryError) {
      return res.status(500).json("Login Error in Server");
    }

    if (data.length > 0) {
      bcrypt.compare(
        req.body.password,
        data[0].password,
        (compareError, isMatch) => {
          if (compareError) {
            return res.status(500).json("Password comparison failed");
          }

          if (isMatch) {
            const userId = data[0].id;
            const token = jwt.sign({ userId }, "jwt-key", { expiresIn: "1d" });
            res.cookie("token", token);
            return res.json({ message: "success" });
          } else {
            return res.status(401).json("Password not matched"); // Use a 401 status for authentication failures
          }
        }
      );
    } else {
      return res.status(404).json("User doesn't exist"); // Use a 404 status for not found
    }
  });
});

app.post("/logout", (req, res) => {
  res
    .clearCookie("token", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .json("User has been logged out");
});

app.listen(8080, () => {
  console.log("Connected");
});
