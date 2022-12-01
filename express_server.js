
// --------------------- REQUIREMENTS
const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require('bcryptjs');
const { userLookup } = require('./helpers');
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

// URL DATABASE
const urlDatabase = {

};

// CHECKS FOR URLS BELONGING ONLY TO LOGGED IN USER
const urlsForUser = (id) => {
  let usersURLS = {};
  for (const item in urlDatabase) {
    if (urlDatabase[item].userID === id) {
      usersURLS[item] = urlDatabase[item];
    }
  }
  return usersURLS;
};

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

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;

  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users,
    cookie: req.session.user_id
  };

  if (!templateVars.cookie) {
    res.redirect('/login');
  }

  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const newData = urlsForUser(req.session.user_id);
  const templateVars = { urls: newData, user: users, cookie: req.session.user_id };
  res.render("urls_index", templateVars);
});

// RESISTER FORM GET REQUEST
app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users, cookie: req.session.user_id };

  res.render("urls_register", templateVars);

});

// LOGIN PAGE GET REQUEST
app.get("/login", (req, res) => {

  res.render("urls_login");

});

app.get("/urls/:id", (req, res) => {
  const newData = urlsForUser(req.session.user_id);
  const shortURL = req.params.id;
  const updatedLongURL = req.body.updatedLongURL;
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users, cookie: req.session.user_id, urls: newData };

  if (req.session.user_id !== urlDatabase[shortURL].userID || req.session.user_id === undefined) {
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
  //const templateVars = { id: req.params.id, user: users, cookie: req.session.user_id };
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }
});

app.get("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  if (req.session.user_id !== urlDatabase[shortURL].userID) {
    res.status(400).send("You do not have permission to delete this entry");
    res.redirect("/urls");
  }
});



// -------EDIT BUTTON POST REQUEST ---------
app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  const updatedLongURL = req.body.updatedLongURL;
  if (req.session.user_id !== urlDatabase[id].userID) {
    res.status(400).send("You do not have permission to edit this entry");
  }
  urlDatabase[shortURL].longURL = updatedLongURL;
  res.redirect('/urls');


});

// -------- LOGIN BUTTON POST REQUEST -------
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (password === '' || email === '') {
    res.status(403).send("Fields cannot be left blank");
  }

  const user = userLookup(email, users);
  if (user === undefined) {
    res.status(403).send("Email or Password is invalid");
  }

  const result = bcrypt.compareSync(password, users[user].password);

  if (result === true && users[user].email === email) {
    req.session.user_id = user;
    res.redirect('/urls');
  } else if (result === false || users[user].email !== email) {
    res.status(403).send("Email or Password is invalid");
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
    res.status(400).send('Invalid credentials');
  }

  if (userLookup(email, users) !== undefined) {
    res.status(400).send('Email is already in use');
  }
  users[userID] = { id: userID, email, password: hashedPassword };
  req.session.user_id = userID;
  res.redirect('/urls');
});

app.post("/urls/:id/update", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.updatedLongURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();

  if (req.session.user_id === undefined) {
    res.redirect('/login');
  } else if (req.session.user_id) {
    urlDatabase[shortURL] = { longURL: longURL, userID: req.session.user_id, time: Date() };
    res.redirect(`/urls/${shortURL}`);
  }



});



// -------------------------- LISTENER

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

