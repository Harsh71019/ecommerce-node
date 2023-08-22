import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  altText: {
    type: String,
    required: true,
  },
});

const heroSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    backgroundImage: [imageSchema], // Array of images
    textColor: {
      type: String,
      required: true,
    },
    buttonText: {
      type: String,
      required: true,
    },
    buttonLink: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const frontPageSchema = new mongoose.Schema(
  {
    welcomeMessage: {
      type: String,
      required: true,
    },
    featuredProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    testimonials: [
      {
        author: {
          type: String,
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const settingsSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
    },
    emailAddress: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      required: true,
    },
    hero: heroSchema,
    frontPage: frontPageSchema,
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
