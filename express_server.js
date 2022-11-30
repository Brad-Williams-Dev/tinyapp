
// --------------------- REQUIREMENTS
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

// Generates a random 6 character string used as shortURLS

const generateRandomString = () => {
  let result = '';
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// USERS DATABASE

const users = {

};

const userLookup = (email) => {
  for (const item in users) {
    if (users[item].email === email) {
      return users[item].email;
    }
  }
  return null;
};


app.set("view engine", "ejs");

// URL DATABASE
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



// ------------------------- MIDDLEWARE

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


//--------------------------GET REQUESTS

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];

  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users,
    cookie: req.cookies['user_id']
  };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users, cookie: req.cookies['user_id'] };
  res.render("urls_index", templateVars);
});

// RESISTER FORM GET REQUEST
app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users, cookie: req.cookies['user_id'] };
  res.render("urls_register", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users, cookie: req.cookies['user_id'] };
  res.render("urls_show", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// -------------------------POST REQUESTS

// -------DELETE BUTTON POST REQUEST ------
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// -------EDIT BUTTON POST REQUEST ---------
app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.updatedLongURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

// -------- LOGIN BUTTON POST REQUEST -------
app.post("/login", (req, res) => {
  //res.cookie("username", req.body.username);
  res.redirect("/urls");
});

// --------- LOGOUT BUTTON POST REQUEST -----
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

// -------USER REGISTRATION POST REQUEST
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = generateRandomString();

  if (email.length === 0 || password.length === 0) {
    res.status(400).send('Invalid credentials');
  }

  if (userLookup(email) !== null) {
    res.status(400).send('Invalid credentials');
  }

  users[userID] = { id: userID, email, password };
  res.cookie("user_id", userID);
  res.redirect('/urls');

  console.log(userLookup(email));
  console.log(users);
});

app.post("/urls/:id/update", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.updatedLongURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});



// -------------------------- LISTENER

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

