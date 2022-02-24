///////////////////////////////////////////
//Helper functions for express_server.js //
//////////////////////////////////////////

//emailCheck determines if the email is in the given database
const emailCheck = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
  return undefined;
};

//generateRandomString generates a random string for unique userID
const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
};

//personalURLS creates a personal URL for each unique userID which creates uniqueness
const personalURLS = function(id, database) {
  let userUrls = {};
  for (const element in database) {
    if (database[element].userID === id) {
      userUrls[element] = database[element];
    }
  }

  return userUrls;
};


module.exports = {
  emailCheck,
  personalURLS,
  generateRandomString
};