const mongoose = require("mongoose");

const { MONGODB_URI } = require("../env");


const connect = async () => {
  console.log("Connecting to MongoDB ...");
  await mongoose
    .connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to MongoDB at: ", MONGODB_URI);
    })
    .catch(console.error);

  mongoose.set("debug", true);
};

module.exports = {
  connect,
};
