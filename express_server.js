
// --------------------- REQUIREMENTS
const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require('bcryptjs');
const { userLookup, generateRandomString, urlsForUser, users, urlDatabase } = require('./helpers');
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

// ------------------------- MIDDLEWARE

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));
app.use(express.static('public'));
app.use('/images', express.static('images'));

//--------------------------GET REQUESTS

app.get('/', (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  } else {
    return res.redirect('/login');
  }
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;

  if (!urlDatabase[shortURL]) {
    return res.status(400).send("That ID does not exsist in the database");
  }

  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users,
    cookie: req.session.user_id
  };

  if (!templateVars.cookie) {
    return res.redirect('/login');
  }

  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const newData = urlsForUser(req.session.user_id);
  const templateVars = { urls: newData, user: users, cookie: req.session.user_id };

  if (req.session.user_id) {
    return res.render("urls_index", templateVars);
  } else {
    return res.status(400).send("You must be logged in to view this page");
  }

});

// RESISTER FORM GET REQUEST
app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users, cookie: req.session.user_id };

  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  res.render("urls_register", templateVars);

});

// LOGIN PAGE GET REQUEST
app.get("/login", (req, res) => {

  if (req.session.user_id) {
    return res.redirect('/urls');
  }

  res.render("urls_login");

});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;

  if (!urlDatabase[shortURL]) {
    return res.status(400).send("That ID does not exsist in the database");
  }

  if (!req.session.user_id) {
    return res.status(400).send("You must be logged in and own the URL to edit");
  }

  const newData = urlsForUser(req.session.user_id);
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users, cookie: req.session.user_id, urls: newData };

  return res.render("urls_show", templateVars);

});


// -------------------------POST REQUESTS

// -------DELETE BUTTON POST REQUEST ------
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  //const templateVars = { id: req.params.id, user: users, cookie: req.session.user_id };
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    delete urlDatabase[req.params.id];
    return res.redirect("/urls");
  }
});

app.get("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  if (!req.session.user_id) {
    return res.status(400).send('You must be logged in and valid owner of URL to delete');
  }
  if (req.session.user_id !== urlDatabase[shortURL].userID) {
    res.status(400).send("You do not have permission to delete this entry");
  }
});



// -------EDIT BUTTON POST REQUEST ---------
app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  const updatedLongURL = req.body.updatedLongURL;
  if (req.session.user_id !== urlDatabase[id].userID) {
    return res.status(400).send("You do not have permission to edit this entry");
  }
  urlDatabase[shortURL].longURL = updatedLongURL;
  res.redirect('/urls');


});

// -------- LOGIN BUTTON POST REQUEST -------
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (password === '' || email === '') {
    return res.status(403).send("Fields cannot be left blank");
  }

  const user = userLookup(email, users);
  if (user === undefined) {
    return res.status(403).send("Email or Password is invalid");
  }

  const result = bcrypt.compareSync(password, users[user].password);

  if (result === true && users[user].email === email) {
    req.session.user_id = user;
    return res.redirect('/urls');
  } else if (result === false || users[user].email !== email) {
    return res.status(403).send("Email or Password is invalid");
  }

});

// ------- REGISTER BUTTON POST REQUEST----
app.post('/register', (req, res) => {
  res.redirect('/register');
});

// --------- LOGOUT BUTTON POST REQUEST -----
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// -------USER REGISTRATION POST REQUEST
app.post("/newAccount", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userID = generateRandomString();

  if (email.length === 0 || password.length === 0) {
    return res.status(400).send('Invalid credentials');
  }

  if (userLookup(email, users) !== undefined) {
    return res.status(400).send('Email is already in use');
  }
  users[userID] = { id: userID, email, password: hashedPassword };
  req.session.user_id = userID;
  res.redirect('/urls');
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.updatedLongURL;



  if (req.session.user_id !== urlDatabase[shortURL].userID || req.session.user_id === undefined) {
    return res.status(400).send("You do not have permission to edit this entry");
  }

  if (req.session.user_id) {
    urlDatabase[shortURL].longURL = longURL;
    return res.redirect('/urls');
  } else {
    return res.status(400).send('You must login to update URLS');
  }

});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();

  if (req.session.user_id === undefined) {
    return res.redirect('/login');
  } else if (req.session.user_id) {
    urlDatabase[shortURL] = { longURL: longURL, userID: req.session.user_id, time: Date() };
    return res.redirect(`/urls/${shortURL}`);
  }
});



// -------------------------- LISTENER

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

