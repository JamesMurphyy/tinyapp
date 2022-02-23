const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const emailCheck = require("./functionHelpers")

const cookieParser = require("cookie-parser");
app.use(cookieParser());


app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = { 
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
}





function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);;
}



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"]
  const user = users[userId]
  console.log(users)
  const templateVars = { user: user, urls: urlDatabase};
  
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"]
  const user = users[userId]
  const templateVars = { user: user}
  res.render('urls_registration', templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.cookies["user_id"]
  const user = users[userId]
  const templateVars = { user: user}
  res.render('urls_login', templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL;
  let redirectURL = `/urls/${shortURL}`;
  res.redirect(redirectURL);        
});

app.post("/urls/:shortURL/delete" , (req, res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL]
  res.redirect("/urls")
})

app.post("/urls/:shortURL" , (req, res) => {
  
  const shortURL = req.params.shortURL
  urlDatabase[shortURL] = req.body.updatedURL
  res.redirect("/urls")
})

app.post("/register" , (req, res) => {
  const userId = generateRandomString()
  const password = req.body.password
  const email = req.body.email


  if (!email || !password) {
    res.status(400).send(`<html><body> enter a valid email and passoword <a href="/register">here</a>.</body></html>\n`);
  } else if (emailCheck(req.body.email, users)) {
    res.status(400).send(`<html><body>This email is already registered. Please enter a valid email and passoword <a href="/register">here</a>.</body></html>\n`);
  } else {
    users[userId] = {
      id: userId, 
      email: req.body.email, 
      password: password
    }
    console.log(users)
    res.cookie("user_id", userId)
    // console.log(users[userId].id)
    res.redirect("/urls")
    }  
  }
)





app.post("/login", (req, res) => {
  // console.log(req.body)
  const userId = req.cookies["user_id"]
  const user = users[userId]
  res.cookie("user_id", user);
  res.redirect("/urls");     
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});







app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"]
  const user = users[userId]
  const templateVars = { user: user}
  res.render('urls_new', templateVars);
});



app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL, username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});