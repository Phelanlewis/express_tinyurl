const bcrypt  = require('bcrypt');
const express = require("express");
const app     = express();
const PORT    = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");

//adds body parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//adds cookie session
const cookieSession = require('cookie-session');
app.use(cookieSession({
  keys: ['Lighthosue Labs']
}));

app.use((req, res, next) => {
  const user = users[req.session.user_id];
  req.user = user;
  res.locals.user = user;
  next();
});

app.use('/urls*?', (req, res, next) => {
  if (!req.user) {
    res.status(401).send('you must <a href="/login">sign in</a>');
    return;
  }
  next();
});

app.use('/urls/:id/:action?', (req, res, next) => {
  const url = urlDatabase[req.params.id];
  if (url && req.user.id !== url.user_id) {
    res.status(403).send('you are not the owner of this URL');
    return;
  }
  next();
});


//random number generator function
function generateRandomString() {
  let random = Math.random().toString(36).substring(5, 13);
  return random;
}

// User and urls database
const urlDatabase = {
  "b2xVn2": {
    shortURL: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    user_id: 'QfoGLg'
  },
  "9sm5xK": {
    shortURL: "9sm5xK",
    longURL: "http://www.google.com",
    user_id: 'x8jkO2'
  }
};

const users = {
  'QfoGLg': {
    id: 'QfoGLg',
    email: 'test',
    password: '$2a$10$i77P2MyaR/qlLUsowSs5Y.xb14CppHGiwuIeVukX63uS58Re0bp7K'
  },
  'x8jkO2': {
    id: 'x8jkO2',
    email: 'asdf',
    password: '$2a$10$a4vHkqNiFxJjPasbjgk1PukOEiV6KH0Exydl9FFnGTSsynR90lkAe'
  }
};

//get the index while logged in
app.get("/urls", (req, res) => {
  const userUrls = {};
  for (let shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].user_id === req.user.id) {
      userUrls[shortUrl] = urlDatabase[shortUrl];
    }
  }
  const templateVars = {
    urls: userUrls
  };
  res.render("urls_index", templateVars);
});

// This the "/" redirects to login
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect(302, "/urls")
  } else {
  res.redirect(302, "/login")
  }
});

//send to create new urls
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//post the newly created url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    shortURL: shortURL,
    longURL: req.body.longURL,
    user_id: req.session.user_id
  };
  res.redirect(`/urls/${shortURL}`)
});

//get specific url to update
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  if(!req.body["longURL"]){
    res.status(404).send('NO DICE!!! Try again');
  } else {
  res.render("urls_show", templateVars);
  }
});

//updates specific url
app.post('/urls/:id', (req, res) => {
  if(!req.body["longURL"]){
    res.redirect('/urls/:id');
  } else {
  urlDatabase[req.params.id].longURL = req.body["longURL"];
  res.redirect('/urls');
  }
});

//deletes specific url
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

//redirect to the longURL
app.get("/u/:shortURL", (req, res) => {
  if (!req.user) {
    res.status(403).send('You didnt say the magic word');
    return;
  }
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//get login page
app.get('/login', (req, res) => {
  res.render('login');
});

// Login user
app.post("/login", (req, res) => {
  for (let userIndex in users) {
    let user = users[userIndex];
  if (!bcrypt.compareSync(req.body.password, user.password)){
    res.status(403).send('bad credentials');
    return;
    }
  req.session.user_id = user.id;
  res.redirect('/');
  }
});

//post the logout function
app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/');
});

//get register page
app.get('/register', (req, res) => {
  res.render('register');
});

//registers new user into user database
app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send('email and password may not be blank');
    return;
  }
  for (let userIndex in users) {
    let user = users[userIndex];
    if (req.body["email"] === user.email) {
    res.status(400).send('email address already taken');
    return;
    }
  }
  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  req.session.user_id = userId;
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
