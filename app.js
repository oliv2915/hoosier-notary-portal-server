require("dotenv").config();
const Express = require("express");
const app = Express();
const db = require("./db");
const {CORS} = require("./middleware");

app.use(CORS);
app.use(Express.json());

const controllers = require("./controllers");
app.use("/user", controllers.userController);
app.use("/customer", controllers.customerController);
app.use("/address", controllers.addressController);

db.authenticate().then(db.sync())
    .then(app.listen(process.env.PORT, console.log(`[Server]: Server is listening on ${process.env.PORT}`)))
    .catch((err) => console.log(`[Server]: Server crashed. Error = ${err}`));