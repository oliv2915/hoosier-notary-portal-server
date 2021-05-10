require("dotenv").config();
const Express = require("express");
const app = Express();
const db = require("./db");
const cors = require("cors");

app.use(cors);
app.use(Express.json());


db.authenticate().then(db.sync())
    .then(app.listen(process.env.PORT, console.log(`[Server]: Server is listening on ${process.env.PORT}`)))
    .catch((err) => console.log(`[Server]: Server crashed. Error = ${err}`));