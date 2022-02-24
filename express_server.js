///////////////////////////////////////////////////
//Constants for server, allowing it to function //
/////////////////////////////////////////////////

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcryptjs');

const {emailCheck, personalURLS, generateRandomString} = require("./functionHelpers");

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: "session",
  keys: ["a","d"]
}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());


app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


const urlDatabase = {};
const users = {};

////////////////////////////////////////////////////



//GET request for applications "/" page.
app.get("/", (req, res) => {
  //Checks to see if user is registered/logged-in and determines a path for that user.
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//GET request for applications "/urls" page.
app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  //Checks to see if user is registered/logged-in.
  if (req.session.user_id) {
    //Sets the URLS library depending on the users personal URLdatabase.
    let templateVars = {urls: personalURLS(req.session.user_id, urlDatabase), user: user};
    res.render("urls_index", templateVars);
  } else {
    //Sends error code if user is not registered/logged in.
    res.status(401).send(`<html><body>Sorry! Please <a href="/login">login</a> or <a href="/register">register</a> to access this page.</body></html>\n`);
  }
});

//GET request for applications "/urls/new" page.
app.get("/urls/new", (req, res) => {
  //Checks to see if theres a valid user_id cookie.
  if (req.session.user_id) {
    //If user adds the new URL, it saves to the URL database.
    const userId = req.session.user_id;
    const user = users[userId];
    const templateVars = { user: user};
    res.render('urls_new', templateVars);
  } else {
    //Redirects user to login if no cookie appearing.
    res.redirect("/login");
  }
});

//GET request for applications "/urls/:shortURL" page.
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const shortURL = req.params.shortURL;
  //Makes sure the URL is the personalized URLdatabase and puts the given information into templateVars object.
  const userUrls = personalURLS(userId, urlDatabase);
  let templateVars = {urlDatabase, userUrls, shortURL , user: user};

  //Checks to make sure there is a proper URL and if the URL belongs to the specific user before sending the templateVar information to urls_show (information used in the document).
  if (!urlDatabase[shortURL]) {
    res.status(404).send(`<html><body>Sorry! This URL does not exist! Please try <a href="/urls">again</a>.</body></html>\n`);
  } else if (!userId || !userUrls[shortURL]) {
    res.status(401).send(`<html><body>Sorry! This URL does not belong to you.</body></html>\n`);
  } else {
    res.render("urls_show", templateVars);
  }

});

//GET request for applications "/u/:shortURL" page.
app.get("/u/:shortURL", (req, res) => {
  //Checks to see if the URL exists in the urlDatabase, if so, it redirects to that desired longURL -- only works if longURL given for shortURl is a proper (working) link.
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    //If an error or the URL link provided is not valid -- this error message appears prompting the user to try again.
    res.status(404).send(`<html><body>This short URL does not exist. Please click <a href="/urls">here</a> to try again.</body></html>\n`);
  }
});

//POST request for applications "/urls" page.
app.post("/urls", (req, res) => {
  //Checks to see if theres a valid user_id cookie.
  if (req.session.user_id) {
    //Generates a random user ID string and creates a personalized database for said string.
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    let redirectURL = `/urls/${shortURL}`;
    res.redirect(redirectURL);
  } else {
    //If no cookie appearing -- user is prompted to either login or register before accessing the "/urls" page.
    res.status(401).send(`<html><body>Sorry! Please <a href="/login">login</a> or <a href="/register">register</a> to access this page.</body></html>\n`);
  }
});

//POST request for applications "/urls/:shortURL" page.
app.post("/urls/:shortURL" , (req, res) => {
  const shortURL = req.params.shortURL;
  //Checks to see if theres a valid user_id cookie.
  if (req.session.user_id) {
    //Checks to see if user_id is connected to the personalized userID database that it is trying to change.
    if (req.session.user_id === urlDatabase[shortURL].userID) {
      //If allowed, the users' data base gets changed based on the updatedURL that was inputted by user on HTML page (urls_show.ejs) --- Ultimately, showing the user the updatedURL that they submitted.
      urlDatabase[shortURL].longURL = req.body.updatedURL;
      res.redirect(`/urls`);
    } else {
      //Sends error message if the usersId does not match the userID of the database being altered.
      res.status(401).send(`<html><body>Sorry! This URL does not belong to you.</body></html>\n`);
    }
  } else {
    //Sends an error message based on if the user is not logged-in or registered (no cookie found).
    res.status(401).send(`<html><body>Sorry! Please <a href="/login">login</a> or <a href="/register">register</a> to access this page.</body></html>\n`);
  }
});

//POST request for applications "/urls/:shortURL/delete" page.
app.post("/urls/:shortURL/delete" , (req, res) => {
  //Checks to see if theres a valid user_id cookie
  if (req.session.user_id) {
    const shortURL = req.params.shortURL;
    //Checks to see if the current user_id is the same ID that is registered as the database library.
    if (req.session.user_id === urlDatabase[shortURL].userID) {
      //If true, the database library for that user and the specific shortURL is deleted off the personalized database.
      delete urlDatabase[shortURL];
      res.redirect("/urls");
    } else {
      //If no valid user_id cookie found, the user is prompted with an error message.
      res.status(401).send(`<html><body>Sorry! Please <a href="/login">login</a> or <a href="/register">register</a> to access this page.</body></html>\n`);
    }
  }
});

//GET request for applications "/login" page.
app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  //Redirects user if user is logged-in.
  if (userId) {
    res.redirect("/urls");
    return;
  }
  const user = users[userId];
  const templateVars = { user: user};
  //Creates and transfers the information from the users cookie and stores it into templateVars.
  res.render('urls_login', templateVars);
});

//GET request for applications "/register" page.
app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  //Redirects user if account has been registered.
  if (userId) {
    res.redirect("/urls");
    return;
  }
  const user = users[userId];
  const templateVars = { user: user};
  //Creates and transfers the information from the users cookie and stores it into templateVars.
  res.render('urls_registration', templateVars);
});

//POST request for applications "/login" page.
app.post("/login", (req, res) => {
  //Checks to see if users email is in the users' database.
  const user = emailCheck(req.body.email, users);
  //If the above is not truthy, an error code is displayed stating that the username cannot be found within the database.
  if (!user) {
    res.status(403).send(`<html><body>This email cannot be found. Please register <a href="/register">here</a>.</body></html>\n`);
    //If the emails are correct, their inputted password is checked with the stored (Hashed) password within the database.
  } else if (!bcrypt.compareSync(req.body.password, users[user].password)) {
    //If false, the error message is displayed, letting the user know that their password credentials is not the correct one stored within the database.
    res.status(403).send(`<html><body>The password you have entered is not correct. Please try <a href="/login">again</a>.</body></html>\n`);
  } else {
    //If all checks out, the user is logged-in and given their specific cookie id -- while being redirected to the "/urls" page.
    req.session["user_id"] = user;
    res.redirect("/urls");
  }
});

//POST request for applications "/register" page.
app.post("/register" , (req, res) => {
  const userId = generateRandomString();
  const password = req.body.password;
  const email = req.body.email;
  //Checks to see if there is no value given for the email or password.
  if (!email || !password) {
    //If no email/password, the user is prompted with the error message stating to enter a valid email and password.
    res.status(400).send(`<html><body>Please enter a valid email and password <a href="/register">here</a>.</body></html>\n`);
  } else if (emailCheck(req.body.email, users)) {
    //Checks to see if the specified email has already been registered, if it has, the user is sent an error code asking the user to please login instead.
    res.status(400).send(`<html><body>This email is already registered. Please enter a valid email and password <a href="/register">here</a>.</body></html>\n`);
  } else {
    //If the user has not registered and the email/password is valid, the user is given a specific user database and given a unique userID where their information is newly stored.
    users[userId] = {
      id: userId,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10) //Created a hashed password for the new user to prevent security issues in the future.
    };
    //Gave the user a userID cookie that is displayed when they are logged-in.
    req.session["user_id"] = userId;
    res.redirect("/urls");
  }
}
);

//POST request for applications "/logout" page.
app.post("/logout", (req, res) => {
  //Used this code to null(eliminate) the users cookies upon the click of the logout button.
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  //Used for server side as it displays that the server is currently running and what port it is running on.
  console.log(`TinyApp app listening on port ${PORT}!`);
});

