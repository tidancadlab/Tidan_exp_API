const mongoose = require("mongoose");

const UserDetailsSchema = new mongoose.Schema(
  {
    userName: { type: String, require },
    userEmail: { type: String, require: true, index:true, unique:true,sparse:true},
    password: { type: String, require },
    userProperty: {
      userSex: { type: String, default: "not available" },
      userID: { type: String, default: "not available" },
      userLevel: { type: Number, default: 1 },
      userDesignation: { type: String, default: "not available" },
      userMob: { type: Number, default: +910000000000 },
      projectName: { type: String, default: "not available" },
      profilePicture: { type: String, default: "not available" },
    },
    time: { type: Number, default: new Date().getTime() },
  },
  
  {
    collection: "UserInfo",
  }
);

let userData = mongoose.model("UserInfo", UserDetailsSchema);
module.exports = userData;
