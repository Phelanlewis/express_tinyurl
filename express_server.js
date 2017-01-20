const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const usersDatabase = {

};

function generateRandomString() {
  let random = Math.random().toString(36).substring(5, 13);
  return random;
}

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(function(req, res, next){
  res.locals.users = req.cookies.usersDatabase;
  res.locals.user_id = usersDatabase[req.cookies.user_id]
  next();
});

function authenticate(email, password) {
  for (let user_id in usersDatabase) {
    let user = usersDatabase[user_id];

    if (email === user.email) {
      if (password === user.password) {
        return user_id;
      } else {
        // found email but password didn't match
        return null;
      }
    }
  }
  // didn't find user for that email
  return null;
}

// Login user
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  let user_id = authenticate(email, password);

  if (user_id) {
    res.cookie("user_id", user_id);
    res.redirect("/");
  } else {
    res.send(403, "<html><body>Wrong email or password</body></html>\n");
    res.end();
  }
});

//Display the newly added URL on their own page
app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
  res.render("urls_new")
} else {
  res.redirect("/urls");
  };
});

// This the "/" redirects to login
app.get("/", (req, res) => {
  res.redirect(302, "/login")
})

//To logout page
app.post("logout", (res, req) => {
  res.clearCookie("user_id")
})

//Deletes the url id
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(302, "/urls");
});

//Updates the urls
app.post("/urls/:id/update", (req, res) => {
  let newLongURL = req.body["newLongURL"];
    console.log(newLongURL);
  urlDatabase[req.params.id] = newLongURL;
    console.log(urlDatabase);
  res.redirect(302, "/urls");
});

//Posts new urls
app.post("/urls", (req, res) => {
  let user_id = req.cookies["user_id"];
  let longURL = req.body["longURL"];
  let shortURL = generateRandomString();
      console.log(longURL);
      console.log(shortURL);
  shortURL[user_id] = { user_id };
  urlDatabase[shortURL] = longURL;
      console.log(urlDatabase);
  res.redirect(302, "/urls");
});

//Index for the app
app.get("/urls", (req, res) => {
  let templateVars = {
    user_id: req.cookies["user_id"],
    users: usersDatabase,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

//Logout
app.post("/logout", (req, res) => {
  console.log(res.cookie);
  res.clearCookie("user_id");
  res.redirect(302, "/urls");
})

//Shows specific url page
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    username: req.cookies["user_id"],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

//Some sort of redirect
app.get("/u/:shortURL", (req, res) => {
 let longURL = urlDatabase[req.params.shortURL];
 if (longURL != null) {
 res.redirect(longURL);
 } else {
   res.end("ERROR");
 }
});

//Get the login page
app.get("/login", (req, res) => {
  res.render("login");
})

//Registration page
app.get("/register", (req, res) => {
  res.render("register");
});

//register email and password
app.post("/register", (req, res) => {
  let email = req.body["email"];
  let password = req.body["password"]
  let user_id = generateRandomString();

  for (let user_id in usersDatabase) {
    let user = usersDatabase[user_id];

    if (email === user.email && password === user.password) {  // JH sez maybe small bug here
      res.send(404, "<html><body>Wrong email or password</body></html>\n");
      res.end();
    }
  }
  if (email === '' && password === ''){ // JH sez maybe small bug here
    res.send(404, "<html><body>Wrong email or password</body></html>\n");
    res.end();
  } else {
    //creates the object
    usersDatabase[user_id] = {
      user_id,
      email,
      password
    };

    res.cookie("user_id", user_id);
    console.log(usersDatabase);
    res.redirect("urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
