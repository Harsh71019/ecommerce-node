import { Types } from "mongoose";

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  postalCode: String,
  country: String,
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    shippingAddress: addressSchema,
    billingAddress: addressSchema,
    authToken: String, // Token for authentication (e.g., JWT)
    resetToken: String, // Token for password reset
    mobileNumber: String, // User's mobile number
    twoFactorAuth: {
      type: Boolean,
      default: false,
    }, // Enable or disable two-factor authentication
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ], // Array of product IDs in user's wishlist
  },
  {
    timestamps: true,
  },
);

userSchema.methods.matchPasswords = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// @ts-expect-error TS(7006): Parameter 'next' implicitly has an 'any' type.
userSchema.pre("save", async function (next) {
  // @ts-expect-error TS(2683): 'this' implicitly has type 'any' because it does not have a type annotation.
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  // @ts-expect-error TS(2683): 'this' implicitly has type 'any' because it does not have a type annotation.
  this.password = await bcrypt.hash(this.password, salt);
});

export interface User {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  isAdmin: boolean;
  mobile: string;
  shippingAddress?: typeof addressSchema;
  billingAddress?: typeof addressSchema;
}

const User = mongoose.model("User", userSchema);
export type UserType = InstanceType<typeof User>;

export default User;
