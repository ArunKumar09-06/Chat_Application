const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


async function handleUserRegistration(req, res) {
     try {
          const { name, email, password } = req.body;
          if (!name || !email || !password) {
               return res.status(400).json({
                    message: "Some required fields are missing"
               });
          }
          const normalizedEmail = email.toLowerCase();
          const existinguser = await User.findOne({
               email: normalizedEmail,
          });

          if (existinguser) {
               return res.status(409).json({
                    message: "User Already exists"
               });
          }

          const hashedPassword = await bcrypt.hash(password, 10);

          const user = await User.create({
               name,
               email,
               password: hashedPassword
          })

          return res.status(201).json({
               message: "User Registered Successfully",
               user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
               }
          });
     } catch (err) {
          console.log(err);

          return res.status(500).json({
               message: "Internal Server Error"
          });
     }
}

async function handleUserLogin(req, res) {
     try {
          const body = req.body
          const email = body.email.toLowerCase();
          const password = body.password;
          const user = await User.findOne({
               email
          });

          if (!user) {
               return res.status(400).json({
                    message: "User not found! Enter valid email"
               });
          }

          const isMatch = await bcrypt.compare(
               password,
               user.password
          );

          if (!isMatch) {
               return res.status(401).json({
                    message: "Password Incorrect! Enter correct password"
               })
          }

          const token = jwt.sign(
               {
                id: user._id,
                email: user.email
               },
               process.env.JWT_SECRET,
               {
                    expiresIn: "7d"
               }
          )
          
          res.cookie("token", token, {
               httpOnly: true,
               secure: false,
               sameSite:  "lax",
               maxAge: 7 * 24 * 60 * 60 * 1000
          });

          return res.status(200).json({
               message: "Login successful",
               user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
               }
          })

     } catch(err){
          return res.status(500).json({
               message: "Error while Logging in! Please try again"         
          });
     }
}

async function handleLogout(req, res){
     try{
          res.clearCookie("token");
          return res.status(200).json({
               message: "Logout Successful"
          });
     }
     catch(err){
          return res.status(500).json({
               message: "Error while logging out",
               error: err.message
          });
     }
}

async function handleProfilePicture(req, res) {
     try{
          if(!req.file){
               return res.status(400).json({
                    message: "Profile picture is required"
               });
          }

          const profilePicture = `uploads/profilePictures/${req.file.filename}`;
          const user = await User.findByIdAndUpdate(
               req.user.id,
               {
                    profilePicture: profilePicture
               },
               {
                    returnDocument: "after"
               }
          ).select("-password");

          if(!user){
               return res.status(404).json({
                    message: "User not found"
               });
          }

          return res.status(200).json({
               message: "Profile picture updated successfully",

               user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    profilePicture: user.profilePicture
               }
          });

     } catch(error){
          console.error("Profile Picture Error: ", err);
          return res.status(500).json({
               message: "Error while updating profile picture"
          });
     }
}

async function handleGetCurrentUser(req, res) {
     try{
          const user = await User.findById(req.user.id).select("-password");
          if(!user){
               return res.status(404).json({
                    message: "User not found"
               });
          }

          return res.status(200).json({
               message: "Current user fetched successfully",
               user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    profilePicture: user.profilePicture,
                    isOnline: user.isOnline,
                    lastSeen: user.lastSeen,
               }
          });
     } catch(error){
          return res.status(500).json({
               message: "Unable to fetch current user"
          });
     }
}

async function handleGetAllUsers(req, res){
     try{
          const users = await User.find({
               _id: {$ne : req.user.id},
          }).select("-password");

          return res.status(200).json({
               message: "Users fetched successfully",
               users,
          });
     } catch(error){
          return res.status(500).json({
               message: "Unable to fetch users",
          });
     }
}

module.exports = {
     handleUserRegistration,
     handleUserLogin,
     handleLogout,
     handleProfilePicture,
     handleGetCurrentUser,
     handleGetAllUsers
}