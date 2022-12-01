
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

const urlsForUser = (id) => {
  let usersURLS = {};
  for (const item in urlDatabase) {
    if (urlDatabase[item].userID === id) {
      usersURLS[item] = urlDatabase[item];
    }
  }
  return usersURLS;
};

const userLookup = (email) => {
  for (const item in users) {
    if (users[item].email === email) {
      return item;
    }
  }
  return null;
};

app.set("view engine", "ejs");

// URL DATABASE
const urlDatabase = {

};



// ------------------------- MIDDLEWARE

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));
app.use('/images', express.static('images'));

//--------------------------GET REQUESTS

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;

  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users,
    cookie: req.cookies['user_id']
  };

  if (!templateVars.cookie) {
    res.redirect('/login');
  }

  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const newData = urlsForUser(req.cookies['user_id']);
  const templateVars = { urls: newData, user: users, cookie: req.cookies['user_id'] };
  res.render("urls_index", templateVars);
});

// RESISTER FORM GET REQUEST
app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users, cookie: req.cookies['user_id'] };
  res.render("urls_register", templateVars);
});

// LOGIN PAGE GET REQUEST
app.get("/login", (req, res) => {

  res.render("urls_login");
});

app.get("/urls/:id", (req, res) => {
  const newData = urlsForUser(req.cookies['user_id']);
  const shortURL = req.params.id;
  const updatedLongURL = req.body.updatedLongURL;
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users, cookie: req.cookies['user_id'], urls: newData };

  if (req.cookies['user_id'] !== urlDatabase[shortURL].userID || req.cookies['user_id'] === undefined) {
    res.status(400).send("You do not have permission to edit this entry");
  } else {
    res.render("urls_show", templateVars);
  }
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// -------------------------POST REQUESTS

// -------DELETE BUTTON POST REQUEST ------
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  const updatedLongURL = req.body.updatedLongURL;
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users, cookie: req.cookies['user_id'] };
  if (req.cookies['user_id'] !== urlDatabase[shortURL].userID) {
    res.status(400).send("You do not have permission to edit this entry");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  const updatedLongURL = req.body.updatedLongURL;
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users, cookie: req.cookies['user_id'] };
  if (req.cookies['user_id'] !== urlDatabase[shortURL].userID) {
    res.status(400).send("You do not have permission to delete this entry");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// -------EDIT BUTTON POST REQUEST ---------
app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  const updatedLongURL = req.body.updatedLongURL;
  if (req.cookies['user_id'] !== urlDatabase[id].userID) {
    res.status(400).send("You do not have permission to delete this entry");
  }
  urlDatabase[shortURL].longURL = updatedLongURL;
  res.redirect('/urls');


});

// -------- LOGIN BUTTON POST REQUEST -------
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = userLookup(email);

  if (users[user].password === password && users[user].email === email) {
    res.cookie("user_id", user);
    res.redirect('/urls');
  } else if (users[user].password !== password || users[user].email === email) {
    res.status(403).send("Email or Password is invalid");
  } else if (password === undefined || email === undefined) {
    res.status(403).send("Invalid credentials");
  }


});

// ------- REGISTER BUTTON POST REQUEST----
app.post('/register', (req, res) => {
  res.redirect('/register');
});

// --------- LOGOUT BUTTON POST REQUEST -----
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});

// -------USER REGISTRATION POST REQUEST
app.post("/newAccount", (req, res) => {
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

});

app.post("/urls/:id/update", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.updatedLongURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  req.cookies;
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();

  if (req.cookies['user_id'] === undefined) {
    res.redirect('/login');
  } else if (req.cookies['user_id']) {
    urlDatabase[shortURL] = { longURL: longURL, userID: req.cookies['user_id'], time: Date() };
    res.redirect(`/urls/${shortURL}`);
  }



});



// -------------------------- LISTENER

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

