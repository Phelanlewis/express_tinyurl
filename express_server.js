const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


const username = {

};

function generateRandomString() {
  let random = Math.random().toString(36).substring(5, 11);
  return random;
}

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));


//Display the newly added URL on their own page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Login Users
app.post("/urls/login", (req, res) => {
  let username = req.body.username
  res.cookie("username", username)
  res.redirect(302,"http://localhost:8080/urls/");
});

app.post("logout", (res, req) => {
  res.clearCookie("user_id")
})
//Deletes the url id
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(302, "/urls/");
});

//Updates the urls
app.post("/urls/:id/update", (req, res) => {
  let newLongURL = req.body["newLongURL"];
  console.log(newLongURL);
  urlDatabase[req.params.id] = newLongURL;
  console.log(urlDatabase);
  res.redirect(302, "/urls/");
});

//Posts new urls
app.post("/urls", (req, res) => {
  let longURL = req.body["longURL"];
  let shortURL = generateRandomString();
      console.log(longURL);
      console.log(shortURL);
  urlDatabase[shortURL] = longURL;
      console.log(urlDatabase);
      console.log('Cookies: ', req.cookies);
      console.log('Signed Cookies: ', req.signedCookies);
  res.redirect(302, "/urls/");
});

//Index for the app
app.get("/urls", (req, res) => {
  let templateVars = {  username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Shows specific url page
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
