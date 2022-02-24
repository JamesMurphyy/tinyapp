

const emailCheck = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return user
    }
  }
  return undefined
}

// const passwordCheck = function(password, database) {
//   for (const user in database) {
//     if (database[user].password === password) {
//       return user
//     }
//   }
//   return undefined
// }


const isCookie = function(cookie, database) {
  for (const user in database) {
    if (cookie === user) {
      return true
    }
  }
  return false
}

const personalURLS = function (id, database) {
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
  isCookie,
  personalURLS
}