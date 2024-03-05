const express = require('express'); //importing express
const path = require("path"); //import build-in path module
const bcrypt = require('bcrypt');
const collection = require("./mongodb");

const app = express(); // create instance of express framework.

//Convert data into json format.
app.use(express.json()); // It allow app to understand JSON dataset in the req. body.

// To accept HTML form data
app.use(express.urlencoded({ extended: false }));

// Set EJS (Embedded JavaScript) as view engine.
app.set('views', path.join(__dirname, './views')); // views is a folder
app.set('view engine', 'ejs');

// Making public folder static where index.html file is present
// By making it static, we can easily serve index.html page
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
  res.render('login');
})

app.get("/signup", (req, res) => {
  res.render('signup');
})

//Register user
app.post("/signup", async (req, res) => {
  const data = {
    name: req.body.username,
    email: req.body.email,
    mobile: req.body.mobile,
    password: req.body.password
  }

  //check user already exists
  const existinguser = await collection.findOne({ name: data.name });
  if (existinguser) {
    res.send("User already exists. Please try another name");
  }
  else {
    // hashing password using bcrypt
    const saltRounds = 10; // Number of salt rounds for bcrypt
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    data.password = hashedPassword; // Replace the original password with the hashed one

    const userdata = await collection.insertMany(data);
    console.log(userdata);
    res.render("home");
  }
})
// Login user
app.post("/login", async (req, res) => {
  try {
    const check = await collection.findOne({ name: req.body.username });
    if (!check) {
      res.send("User name cannot found");
    }

    // Compare the hashed password from the database with the plaintext password
    const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
    if (!isPasswordMatch) {
      res.send("wrong Password");
    }
    else {
      res.render("home");
    }
  }
  catch {
    res.send("wrong Details");
  }
});


// lifting the app on port 5002.
const port = 5002;
app.listen(port, () => {
  console.log(`Server runing on the port: ${port}`);
})