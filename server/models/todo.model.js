const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index:true,
    },

    description: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      enum: ['pending', 'completed', 'out of date'],
      default: 'pending',
      index:true,
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
      validate: {
        validator: function (v) {
          if (!v || !this.startDate) return true;
          return v >= this.startDate;
        },
        message: 'endDate must be >= startDate',
      },
      index:true,
    },
  },
  {
    timestamps: true,
  }
  
);

module.exports = mongoose.model('Todo', todoSchema);
