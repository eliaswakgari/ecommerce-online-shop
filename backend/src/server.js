require('dotenv').config();
const app = require("./app");
const connectDB = require("./config/db");
//const logger = require("./config/logger");
const PORT = process.env.PORT || 5000;

// Start the server by using imported app object
connectDB();
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server error:', err);
});
 