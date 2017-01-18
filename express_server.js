const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let random = Math.random().toString(36).substring(5, 11);
  return random;
}

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let longURL = req.body["longURL"];
  let shortURL = generateRandomString();
  console.log(longURL);
  console.log(shortURL);
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase);
  res.redirect(302, "http://localhost:8080/urls/"+shortURL);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

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
