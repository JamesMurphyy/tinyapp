const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcryptjs');
const {emailCheck, isCookie, personalURLS} = require("./functionHelpers")

const cookieSession = require('cookie-session');
app.use(cookieSession({name: "session", keys: ["a","d"]}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());


app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
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
  // console.log(req.session["user_id"])
  if (req.session["user_id"]) {
    res.redirect("/urls")
  } else {
    res.redirect("/login")
    
  }







  // if (isCookie(req.cookies.user_id, users)) {
  //   res.redirect("/urls")
    
  // } else {
  //   res.redirect("/login")
  // }
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });



app.get("/urls", (req, res) => {
  const userId = req.session.user_id
  const user = users[userId]
  // console.log(users)
  if (userId) {
    let templateVars = {urls: personalURLS(userId, urlDatabase), user: user}
    // console.log(templateVars)
    // const templateVars = { user: user, urls: urlDatabase};
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login")
  }
  // console.log(templateVars)
  // if (!isCookie(req.cookies.user_id, users)) {
  //   // res.redirect("/login")
  // }
  // let templateVars = {urls: personalURLS(userId, urlDatabase), user: user}
  // console.log(templateVars)
  // // const templateVars = { user: user, urls: urlDatabase};
  // res.render("urls_index", templateVars);


});




app.get("/register", (req, res) => {
  const userId = req.session["user_id"]
  const user = users[userId]
  const templateVars = { user: user}
  res.render('urls_registration', templateVars);
});




app.get("/login", (req, res) => {
  const userId = req.session["user_id"]
  const user = users[userId]
  const templateVars = { user: user}
  res.render('urls_login', templateVars);
});





app.post("/urls", (req, res) => {
  if (req.session.user_id) {

  let shortURL = generateRandomString()
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  // urlDatabase[shortURL] = req.body.longURL;
  let redirectURL = `/urls/${shortURL}`;
  res.redirect(redirectURL);  
  
  }else {
    res.status(401).send(`<html><body>Sorry! Please <a href="/login">login</a> or <a href="/register">register</a> to access this page.</body></html>\n`);
  }      
});





app.post("/urls/:shortURL/delete" , (req, res) => {
  if (req.session.user_id) {
    const shortURL = req.params.shortURL
    
    if (req.session.user_id === urlDatabase[shortURL].userID) {
        delete urlDatabase[shortURL]
        res.redirect("/urls")
    }
    else {
  res.status(401).send(`<html><body>Sorry! Please <a href="/login">login</a> or <a href="/register">register</a> to access this page.</body></html>\n`);
  }   
  }
})




app.post("/urls/:shortURL" , (req, res) => {
  const userId = req.session["user_id"]
  const user = users[userId]
  const shortURL = req.params.shortURL;
  if (req.session.user_id) {

    urlDatabase[shortURL].longURL = req.body.updatedURL;
    // console.log(urlDatabase[shortURL])
    // console.log(req.body.updatedURL)
    console.log(users)
    res.redirect(`/urls`);
    
  } else {
    res.status(401).send(`<html><body>Sorry! Please <a href="/login">login</a> or <a href="/register">register</a> to access this page.</body></html>\n`);
  }



  // urlDatabase[shortURL] = req.body.updatedURL
  // res.redirect("/urls")
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
      password: bcrypt.hashSync(req.body.password, 10)
    }
    // console.log(users)
    req.session.user_id = userId
    // ("user_id", userId)
    // console.log(users[userId].id)
    res.redirect("/urls")
    }  
  }
)





app.post("/login", (req, res) => {
  // console.log(req.body)
  const user = emailCheck(req.body.email, users)
  // const password = passwordCheck(req.body.password, users)
  // console.log(users[user].password)
  // console.log(req.body.password)



  if (!user) {
    res.status(403).send(`<html><body>This email cannot be found. Please register <a href="/register">here</a>.</body></html>\n`);
  } else if (!bcrypt.compareSync(req.body.password, users[user].password)) {
    // users[users].password
    res.status(403).send(`<html><body>The password you have entered is not correct. Please try <a href="/login">again</a>.</body></html>\n`);
  } else {
    // console.log(req.body.password)
    // console.log(users[user].password)
    req.session.user_id = user;
    res.redirect("/urls");  
  }
});



app.post("/logout", (req, res) => {
  // res.clearCookie("user_id");
  req.session = null;
  res.redirect("/urls");
});







app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const userId = req.session["user_id"]
    const user = users[userId]
    const templateVars = { user: user}
    res.render('urls_new', templateVars);
  } else {
    res.redirect("/login")
  }
  
});



app.get("/u/:shortURL", (req, res) => {
  // if (req.session.user_id) {
  //   const longURL = urlDatabase[req.params.shortURL].longURL //////maybe delete
  //   res.redirect(longURL);
  // } else {
  //   res.status(401).send(`<html><body>Sorry! Please <a href="/login">login</a> or <a href="/register">register</a> to access this page.</body></html>\n`);
  // }  
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.status(404).send(`<html><body>This short URL does not exist. <a href="/login">login</a> or <a href="/register">register</a> to access this page.</body></html>\n`);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (req.session.user_id) {
    const userId = req.session["user_id"]
    const user = users[userId]
    const shortURL = req.params.shortURL;
    // const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL, user: user};
    const userUrls = personalURLS(userId, urlDatabase)
    let templateVars = {urlDatabase, userUrls, shortURL , user: user}
    res.render("urls_show", templateVars);
    } else {
      res.status(401).send(`<html><body>Sorry! Please <a href="/login">login</a> or <a href="/register">register</a> to access this page.</body></html>\n`);
    }  
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

