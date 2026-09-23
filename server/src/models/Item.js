import mongoose from 'mongoose';

// TODO: define the Item schema per README.md section 1.

const itemSchema = new mongoose.Schema(
  {
    // TODO
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: {
      type: String,
      enum: ['electronics', 'clothing', 'documents', 'accessories', 'other'],
      default: 'other'
    },
    status: {
      type: String,
      enum: ['lost', 'found', 'claimed'],
      default: 'lost'
    },
    location: { type: String, trim: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// TODO: add the uniqueness constraint described in README.md section 1.
// Compound unique index: the PAIR (title, location) must be unique.
// Same title at a different location is allowed; same title at the same location is rejected.
itemSchema.index({ title: 1, location: 1 }, { unique: true });

export const Item = mongoose.model('Item', itemSchema);
