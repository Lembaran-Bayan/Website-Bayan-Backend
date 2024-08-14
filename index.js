const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const process = require("process");
const articleRoutes = require("./src/routes/ArticleRoutes");
const app = express();
const jwt = require('jsonwebtoken');

// DOTENV CONFIG
dotenv.config();

// MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan("dev"));

// CORS
app.use(cors({ origin: process.env.NODE_ENV !== "DEV" ? "https://www.lembaran-bayan.id" : "http://localhost:3000" }));
console.log(process.env.NODE_ENV !== "DEV" ? "https://www.lembaran-bayan.id" : "localhost:3000")

// MONGODB CONNECTION
if (!process.env.MONGO_URI) {
  throw Error("Database connection string not found");
}
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Succesfully connected to MongoDB");
  }).catch((err) => {
    console.log("Failed to connect to MongoDB");
    console.log(err);
  });

// ROUTES
app.get("/", (req, res) => {
  res.send(`
      <html>
        <head>
          <title>Lembaran Bayan Backend</title>
          <meta name="description" content="Backend Website Lembaran Bayan" />
        </head>
        <body>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
            * {
              padding: 0;
              margin: 0;
              box-sizing: border-box
            }
            main {
              display: flex;
              flex-direction: column;
              justify-content: flex-end;
              align-items: center;
              min-height: 100vh;
              font-family: "Plus Jakarta Sans", sans-serif; 
              background-image: url("https://kkn.lembaran-bayan.id/Tim.png");
              background-size: cover;
              background-position: center;
            }
            section {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              z-index: 2;
              margin-bottom: 150px;
            }
            h1 {
              font-weight: 700;
              color: white;
              margin-top: 20px;
              font-size: 25px;
            }
            div {
              background: linear-gradient(45deg, #298c86, #ffba08);
              height: 100vh;
              width: 100vw;
              position: absolute;
              top: 0;
              left: 0;
              z-index: 1;
              opacity: .5;
            }
          </style>
          <main>
            <section>
              <img style="width: 200px" src="https://lembaran-bayan.id/Logo.png"/>
              <h1>Lembaran Bayan Backend</h1>
            </section>
            <div />
          </main>
      </html>
    `);
});
app.use("/article", articleRoutes)

app.post('/login', (req, res) => {
  const { password } = req.body;

  // Check if the password matches the admin password
  if (password === process.env.ADMIN_PASSWORD) {
    // Create a JWT payload (you can include more information if needed)
    const payload = { role: 'admin' };

    // Sign the token with the secret key
    const token = jwt.sign(payload, process.env.ADMIN_PASSWORD, { expiresIn: '1h' });

    return res.json({ message: 'Login successful', token });
  } else {
    return res.status(401).json({ message: 'Invalid password' });
  }
});

app.post('/validate-token', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ valid: false, message: 'No token provided' });
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.ADMIN_PASSWORD);

    // If the token is valid, return a success response
    res.json({ valid: true, decoded });
  } catch (error) {
    // If the token is invalid or expired, return an error response
    res.status(401).json({ valid: false, message: 'Invalid or expired token' });
  }
});

// NO ROUTE FOUND
app.use((req, res, next) => {
  const err = new Error('No route found on the server');
  err.status = 404;
  next(err);
});

// ERROR HANDLER
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  return res.json({
    error: {
      message: err.message,
      status: err.status
    }
  });
});

// APP START
app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});