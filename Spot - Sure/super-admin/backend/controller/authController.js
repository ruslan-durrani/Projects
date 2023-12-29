
const User = require("../model/userModel");
const bcrypt = require("bcryptjs")
const Organization = require("../model/organizationModel")
const Vehicle = require("../model/vehicleSchema")

const isLoggedIn = async (req,res) => {
  if(req.userID) {
    return res.status(200).send({"isLoggedIn": true})
  }
  else {
    return res.status(404).send({"isLoggedIn": false})
  }
}



const login = async (req, res) => {
        try {

          // console.log("Email", emailAddress, "Pas", password)
      
          // Get the user data from the request body
          const { emailAddress, password } = req.body;
         
          if (!emailAddress || !password) {
            return res
              .status(400)
              .json({ error: "Please fill the fields properly." });
          }
      
          // Find the user in the database by their email
          const user = await User.findOne({ emailAddress: emailAddress, typeOfUser: "Super-Admin" });
          console.log("user found", user)
          if (user) {
            // Comparing password
            // console.log(user)
            const isMatch = await bcrypt.compare(password, user.password);
      
            const token = await user.generateAuthToken();
            // console.log("Token is", token)
      
            // Storing JWT Token in Cookie
            res.cookie("spotSureSuperAdminCookie", token, {
              expires: new Date(Date.now() + 25892000000),
              httpOnly: true,
            });
      
            if (!isMatch) {
              res.status(400).json({ error: "Invalid Credentials." });
            } else {
              res.status(200).json({ message: "Login successful!" });
            }
          } else {
            res.status(400).json({ error: "Invalid Credentials." });
          }
        } catch (error) {
          console.error("Error logging in:", error);
          res.status(500).json({ error: "An error occurred while logging in." });
        }
      }

const logout =  (req, res) => {
        // Clearing the authentication cookie
        res.clearCookie('spotSureSuperAdminCookie');
        res.status(200).send({ message: 'Logged out successfully' });
      }


const dashboardData = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const adminCount = await User.countDocuments({ typeOfUser: 'Admin' });
    const organizationCount = await Organization.countDocuments();
    const vehicleCount = await Vehicle.countDocuments();
    console.log(adminCount);
    
    res.status(200).json({ totalUsers: userCount, 
                           totalAdmins: adminCount, 
                           totalOrganization: organizationCount, 
                           totalVehicles: vehicleCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}



module.exports = {
    login,
    isLoggedIn,
    logout,
    dashboardData,


}