const mongoose = require("mongoose");

const expensesData = new mongoose.Schema(
  {
    expDate: { type: Date, require: true, default: Date() },
    expItem: { type: String, require: true, lowercase: true },
    expVendor: { type: String, require: true, lowercase: true },
    expAmount: { type: Number, require: true },
    expRemark: { type: String, lowercase: true },
    expUploaded: { type: String, require: true, lowercase: true },
    expApprovalStatus: { type: String, require: true, default: "pending" },
    expUploadedOnTime: { type: Date, default: new Date(Date.now() + 19800) },
    userId: { type: String, require: true, Error: "Please Enter Data" },
    expComments: "",
    userLevel: Number,
    attachment: {
      data: "",
      lastModified: { type: Date, default: new Date(Date.now() + 19800) },
      name: "",
      size: Number,
      type: "",
    },
    invoiceNum: "",
    paymentHead: "",
    paymentType: "",
    projectName: "",
    reportingOfficer: "",
    ActionedBy_id: "",
  },
  {
    collection: "ExpensesData",
  }
);
let ExpensesData = mongoose.model("ExpensesData", expensesData);
module.exports = ExpensesData;
