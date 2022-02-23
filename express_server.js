const express = require("express");
const app = express();
const PORT = 8080; // default port 8080


const cookieParser = require("cookie-parser");
app.use(cookieParser());


app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



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
  const templateVars = { username: req.cookies["username"], urls: urlDatabase};
  
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { username: req.cookies["username"]}
  res.render('urls_registration', templateVars);
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






app.post("/login", (req, res) => {
  // console.log(req.body)
  res.cookie("username", req.body.username);
  res.redirect("/urls");     
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});







app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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