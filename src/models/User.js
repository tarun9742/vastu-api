
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: undefined,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: undefined,
    },

    passwordHash: {
      type: String,
      select: false,
    },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
      index: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    addresses: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    }, 

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
 
    otp: {
      type: String,
      select: false, 
    }, 

    otpExpiresAt: {
      type: Date,
      select: false,
    },

    otpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    mobileVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Only index email when it has a value.
UserSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      email: { $type: "string" },
    },
  }
);

// Mobile numbers must be unique when present.
UserSchema.index(
  { phone: 1 },
  {
    unique: true,
    sparse: true,
  }
);

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);
