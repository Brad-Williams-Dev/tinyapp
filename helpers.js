

const userLookup = (email, database) => {
  for (const item in database) {
    if (database[item].email === email) {
      return item;
    }
  }
  return undefined;
};

module.exports = { userLookup };