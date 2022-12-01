const { assert } = require('chai');

const { userLookup } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('userLookup', function() {
  it('should return a user with valid email', function() {
    const user = userLookup("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal("userRandomID", expectedUserID);
  });

  it('should return undefined if user email is not found', function() {
    const user = userLookup("user3@example.com", testUsers);
    const expectedUserID = undefined;
    assert.equal(undefined, expectedUserID);
  });

});