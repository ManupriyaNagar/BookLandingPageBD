const mongoose = require('mongoose');

const bookOrderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    mobile: {
        type: String,
        required: [true, 'Mobile number is required'],
        trim: true,
        match: [/^[0-9]{10,15}$/, 'Please enter a valid mobile number']
    },
    copies: {
        type: Number,
        required: [true, 'Number of copies is required'],
        min: [1, 'At least 1 copy must be ordered'],
        max: [100, 'Cannot order more than 100 copies at once']
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
        maxlength: [50, 'City name cannot exceed 50 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    orderValue: {
        type: Number,
        default: function() {
            return this.copies * 500; // Assuming 500 per book
        }
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});

// Virtual for formatted date
bookOrderSchema.virtual('formattedDate').get(function() {
    return this.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
});

// Index for better query performance
bookOrderSchema.index({
    createdAt: -1
});
bookOrderSchema.index({
    email: 1
});
bookOrderSchema.index({
    city: 1
});
bookOrderSchema.index({
    status: 1
});

module.exports = mongoose.model('BookOrder', bookOrderSchema);