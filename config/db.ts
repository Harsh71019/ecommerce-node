import mongoose from "mongoose";
// @ts-expect-error TS(2792): Cannot find module 'colors'. Did you mean to set the 'moduleResolution' option to 'node', or to add aliases to the 'paths' option?
import colors from "colors";

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI || "", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // @ts-expect-error TS(2339): Property 'cyan' does not exist on type 'string'.
    console.log(`MongoDB Connected ${connect.connection.host}`.cyan.underline);
  } catch (error) {
    // @ts-expect-error TS(18046): 'error' is of type 'unknown'.
    console.error(`Error: ${error.message}`);

    process.exit(1);
  }
};

export default connectDB;
