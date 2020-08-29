//jshint esversion:6
const ejs=require("ejs");
const bodyParser=require("body-parser");
const express=require("express");
const mongoose=require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const fs=require("fs");

// const authRoute=require("./routes/authentication");
const homeRoute=require("./routes/home");
// const submitRoute=require("./routes/submit");

const app=express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(express.json());
app.set('view engine', 'ejs');

app.use(session({
  secret: "My little secret.This can be any string.Check documentation!",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB",{ useNewUrlParser: true,useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);


app.use('/', homeRoute);
// app.use('/auth', authRoute);
// app.use('/submit', submitRoute);

app.listen(3000,function(req,res){
  console.log("server started in port 3000!");
});
