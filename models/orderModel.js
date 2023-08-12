import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const transitStatusSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['pending', 'inTransit', 'delivered'],
      default: 'pending',
    },
    timestamp: {
      type: Date,
    },
  },
  {
    _id: false,
  }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      street: String,
      city: String,
      postalCode: String,
      country: String,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentResult: {
      id: String,
      status: String,
      updateTime: String,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    returnRequested: {
      type: Boolean,
      default: false,
    },
    returnRequestedAt: {
      type: Date,
    },
    returnApproved: {
      type: Boolean,
      default: false,
    },
    returnApprovedAt: {
      type: Date,
    },
    returnRejected: {
      type: Boolean,
      default: false,
    },
    returnRejectedAt: {
      type: Date,
    },
    returnCompleted: {
      type: Boolean,
      default: false,
    },
    returnCompletedAt: {
      type: Date,
    },
    transitStatus: transitStatusSchema,
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
