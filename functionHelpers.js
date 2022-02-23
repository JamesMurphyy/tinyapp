

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

module.exports = {
  emailCheck
}