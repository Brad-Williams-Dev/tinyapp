

const userLookup = (email, database) => {
  for (const item in database) {
    if (database[item].email === email) {
      return item;
    }
  }
  return undefined;
};

// Generates a random 6 character string used as shortURLS

const generateRandomString = () => {
  let result = '';
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
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

// USERS DATABASE

const users = {

};

// URL DATABASE
const urlDatabase = {

};

module.exports = { userLookup, generateRandomString, urlsForUser, users, urlDatabase };