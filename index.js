let express = require("express");
let app = express();
let port = 8080;
app.listen(port);
app.use(express.static('./docs'));
console.log(`Ready: http://localhost:${port}`);