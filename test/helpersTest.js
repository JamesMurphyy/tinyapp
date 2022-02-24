const { assert } = require('chai');

const { emailCheck } = require('../functionHelpers.js');

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

describe('emailCheck', function() {
  it('should return a user with valid email', function() {
    const user = emailCheck("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(user, expectedUserID)
  });
  it('should return undefined with an invalid email', function() {
    const user = emailCheck("user222@example.com", testUsers)
    const expectedUserID = undefined;
    // Write your assert statement here
    assert.equal(user, expectedUserID)
  });
});