const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const userData = require("./Module/User");
const ExpensesData = require("./Module/expensesModule");
const mongoose = require("mongoose");
const cors = require("cors");
app.use(express.json());
require("dotenv").config();
mongoose.set("strictQuery", true);
require("dns").lookup("www.google.com", function (err) {
  if (err) {
    checkInternet(false);
  } else {
    checkInternet(true);
  }
});

const port = process.env.port || 5500;

let jwt_token_key =
  "sndkjkvicxgiusdf9er73489djkfgvndfvhjfewur34t6r7e8hfnfdkjndfvd98fewipewfdsfsad0fdsfdsyf87ewrt38ryuhjbsd";

app.use(
  cors({
    origin: "*",
  }),
  express.json()
);

function checkInternet(isConnected) {
  if (isConnected) {
    mongoose
      .connect(process.env.DB_CONNECT, { useNewUrlParser: true })
      .then(() => {
        console.log("DB connected...");
      })
      .catch((err) => {
        console.log("Not connected");
      });
  } else {
    console.log("No internet.......");
  }
}

app.get("/search/:key", async (req, res) => {
  let data = userData.find({
    $or: [
      { userName: { $regex: req.params.key } },
      { userEmail: { $regex: req.params.key } },
    ],
  });
  res.send(data);
});
app.post("/registerUser", async (req, res) => {
  const { userEmail, userName, password } = req.body;
  if (!(userName && userEmail && password)) {
    res.send({ err: "Please enter all field" });
  } else {
    const allUser = await userData.findOne({ userEmail });
    if (!allUser) {
      let result = await userData.create({ userEmail, userName, password });
      res.send(result);
    } else {
      res.send({ err: "User already Exist!" });
    }
  }
});

let a = 0;

app.get("/addExpenses/:key", async (req, res) => {
  let result = ExpensesData.find(
    {
      $or: [
        { expUploaded: { $regex: req.params.key, $options: "/W+/igd" } },
        { expItem: { $regex: req.params.key, $options: "/W+/igd" } },
        { expApprovalStatus: { $regex: req.params.key, $options: "/W+/igd" } },
        { expVendor: { $regex: req.params.key, $options: "/W+/igd" } },
        // { expAmount: { $regex: AmountData } },
      ],
    } || {}
  );
  res.send(result);
});

app.get("/addExpenses", async (req, res) => {
  let result = await ExpensesData.find({}).sort({ expUploadedOnTime: -1 });
  res.send(result);
});
let called = 0;
app.post("/dashBoard", async (req, res) => {
  const { userId } = req.body;
  let result = await ExpensesData.find({ userId: userId }).sort({
    expUploadedOnTime: -1,
  });
  res.send({ code: false, data: result });
  console.log(++called);
});
app.post("/viewExp", async (req, res) => {
  const { _id } = req.body;
  let result = await ExpensesData.find({ _id: _id });
  if (!result) {
    return;
  }
  res.send(result);
});

app.post("/addNewExpenses/add", async (req, res) => {
  let result = await ExpensesData.create(req.body);
  res.send(result);
});

app.delete("/addExpenses/:id", async (req, res) => {
  let result = await ExpensesData.findByIdAndDelete({ _id: req.params.id });
  res.send(result);
});

//Approval Page API
app.patch("/approval/:id", async (req, res) => {
  let result = await ExpensesData.findByIdAndUpdate(req.params.id, req.body);
  res.send(result);
});

app.post("/login", async (req, res) => {
  const { userEmail, password } = req.body;
  if (userEmail) {
    let user = await userData.findOne({ userEmail: userEmail });
    if (await !user) {
      return res.status(404).json({ err: "User Not found" });
    }
    if ((await password) === user.password) {
      const token = jwt.sign(
        {
          userName: user.userName,
          userEmail: user.userEmail,
          userRegisteredDate: user.time,
          userId: user._id,
          userProperty: user.userProperty,
        },
        jwt_token_key
      );
      res.cookie("token", token, {
        httpOnly: false,
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });
      res.cookie("userId", user._id, {
        httpOnly: false,
      });

      if (res.status(201)) {
        return res.send({ status: "ok", data: token, user: user.userProperty });
      }
      res.send(token);
    } else {
      return res.status(401).json({ err: "Wrong Password" });
    }
  }
});

app.post("/userDataProperty", async (req, res) => {
  const { userId } = req.body;
  if (userId === undefined) {
    return res.send({ data: "not Found" });
  } else {
    let userProperty = await userData.findOne({ _id: userId });
    userProperty.password = undefined;
    res.send(userProperty);
  }
});

app.post("/loggedUserData", async (req, res) => {
  const { token } = req.body;
  try {
    if (await token) {
      const user = jwt.verify(token, jwt_token_key);
      res.send(user);
      console.log(user);
    }
  } catch (err) {
    console.log(err);
  }
});

app.patch("/updateUserProperty", async (req, res) => {
  const { _id } = req.body;
  let user = await userData.findByIdAndUpdate(_id, req.body);
  res.send(user);
});

app.get("/allUser", async (req, res) => {
  const user = await userData.find({}).sort({ userEmail: 1 });
  if (user) {
    let data = [];
    for (const dataObj of user) {
      data.push({
        _id: dataObj._id,
        userName: dataObj.userName,
        paymentOpt: dataObj.paymentOpt,
      });
    }
    res.send(data);
  }
});

app.post("/approveExpenses", async (req, res) => {
  const { reportingOfficer, userLevel } = req.body;
  const data = await ExpensesData.find({ expApprovalStatus: "pending" });
  const dF = data.filter((a) => {
    return a.reportingOfficer
      ? a.reportingOfficer === reportingOfficer
      : a.userLevel < userLevel;
  });
  if (data) {
    res.status(200).send(dF);
  } else {
    res.status(401).send({ msg: "data not found!" });
  }
});

app.put("/updateOpt", async (req, res) => {
  const data = req.body;
  const { _id } = req.query;
  const user = await userData.updateOne(
    { _id },
    { $push: { paymentOpt: data } }
  );
  res.send(user);
  console.log(data);
  res.sendStatus(200);
});

// app.get("/userTest", async (req, res) => {
//   const { _id } = req.query;
//   const user = await userData.findById({ _id });
//   res.send(user);
// });

app.listen(port, () => {
  console.log(`server Running on ${port}`);
});
