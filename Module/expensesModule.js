const mongoose = require("mongoose");

const expensesData = new mongoose.Schema(
  {
    expDate: { type: Date, require: true },
    expItem: { type: String, require: true, lowercase: true },
    expVendor: { type: String, require: true, lowercase: true },
    expAmount: { type: Number, require: true },
    expRemark: { type: String, lowercase: true },
    expUploaded: { type: String, require: true, lowercase: true },
    expApprovalStatus: { type: String, require: true, lowercase: true },
    expUploadedOnTime: { type: Date, default: Date() },
    userId: { type: String, require: true, Error: "Please Enter Data" },
    expComments: "",
    userLevel: Number,
  },
  {
    collection: "ExpensesData",
  }
);
let ExpensesData = mongoose.model("ExpensesData", expensesData);
module.exports = ExpensesData;
