const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const userData = require("./Module/User");
const ExpensesData = require("./Module/expensesModule");
const mongoose = require("mongoose");
const cors = require("cors");
app.use(express.json());
// require("dotenv").config();
mongoose.set("strictQuery", true);
require("dns").lookup("www.google.com", function (err) {
  if (err) {
    checkInternet(false);
  } else {
    checkInternet(true);
  }
});

const port = process.env.port || 5500;

///this is just test
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
app.post("/", async (req, res) => {
  const { userEmail, userName, password } = req.body;
  if (!(userName && userEmail && password)) {
    res.send({ err: "Please enter all field" });
  } else {
    const allUser = userData.findOne({ userEmail });
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
  let result = ExpensesData.find({}).sort({ expUploadedOnTime: -1 });
  res.send(result);
});

app.post("/dashBoard", async (req, res) => {
  const { userId } = req.body;
  let result = ExpensesData.find({ userId: userId }).sort({
    expUploadedOnTime: -1,
  });
  res.send(result);
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
  let result = ExpensesData.findByIdAndDelete({ _id: req.params.id });
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
    let user = userData.findOne({ userEmail: userEmail });
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
    let userProperty = userData.findOne({ _id: userId });
    userProperty.password = undefined;
    res.send(userProperty);
  }
});

app.post("/loggedUserData", async (req, res) => {
  const { token } = req.body;
  try {
    if (token) {
      const user = jwt.verify(token, jwt_token_key);
      res.send(user);
    }
  } catch (err) {
    console.log(err);
  }
});

app.patch("/updateUserProperty", async (req, res) => {
  const { _id } = req.body;
  let user =  userData.findByIdAndUpdate(_id, req.body);
  res.send(user);
});

app.listen(port, () => {
  console.log(`server Running on ${port}`);
});
