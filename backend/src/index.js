require("dotenv").config();

const app = require ('./app');
const PORT = 8001;

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});




