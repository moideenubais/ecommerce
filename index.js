const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const socket = require("socket.io");
const http = require("http");

const product = require("./routes/product");
const login = require("./routes/login");
const category = require("./routes/category");
const brand = require("./routes/brand");
const user = require("./routes/user");
const flash = require("./routes/flash");
const order = require("./routes/order");
const report = require("./routes/report");
const ad = require("./routes/ad");
const subscriber = require("./routes/subscriber");
const shop = require("./routes/shop");
const notification = require("./routes/notification");
const role = require("./routes/role");
const roleRoute = require("./routes/roleRoute");
const general = require("./routes/general");
const color = require("./routes/color");
const attribute = require("./routes/attribute");
const review = require("./routes/review");
// const subscribe = require("./routes/subscribe");
const auth = require("./middleware/auth");
const { Notification } = require("./models/notification");

const {invokePolices} = require("./policyInvoke");

const app = express();
const server = http.createServer(app);
const io = socket(server, {
  cors: {
    origin: process.env.FRONT_END_URL,
    methods: ["GET", "POST"],
  },
});
invokePolices();

app.use(helmet({ contentSecurityPolicy: false }));
app.use("/CategoryImages", express.static("CategoryImages"));
app.use("/ProductImages", express.static("ProductImages"));
app.use("/BrandImages", express.static("BrandImages"));
app.use("/UserImages", express.static("UserImages"));
app.use("/FlashImages", express.static("FlashImages"));
app.use("/AdImages", express.static("AdImages"));
app.use("/ShopImages", express.static("ShopImages"));
app.use(express.json());
app.use(cors());

app.use("/api/product", product);
app.use("/api/login", login);
app.use("/api/category", category);
app.use("/api/brand", brand);
app.use("/api/user", user);
app.use("/api/flash", flash);
app.use("/api/order", order);
app.use("/api/report", report);
app.use("/api/ad", ad);
app.use("/api/subscriber", subscriber);
app.use("/api/shop", shop);
app.use("/api/notification", notification);
app.use("/api/role", role);
app.use("/api/route", roleRoute);
app.use("/api/general", general);
app.use("/api/color", color);
app.use("/api/attribute", attribute);
app.use("/api/review", review);
// app.use("/api/subscribe", subscribe);
app.use("/api/tokenIsValid", auth, (req, res) => {
  res.send({ value: true, message: "success" });
});

const port = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Connected to the database!");
    server.listen(port, () => {
      console.log(`listening on port ${port}`);
      io.on("connection", (client) => {
        console.log("Made socket connention");
        client.on("disconnect",()=>{
          console.log("Disconnected")
        })
        client.on("send-notification", async(msg) => {
          try {
            const notifications = await Notification.find();
            io.emit("new-notification", notifications);
          } catch (error) {
            console.log("Server Error in send-notification",error)
          }
        });
      });
    });
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

