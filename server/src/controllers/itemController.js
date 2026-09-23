import { Item } from '../models/Item.js';

// TODO: write a validation schema for create/update per README.md section 2.
import Joi from 'joi';

const CATEGORIES = ['electronics', 'clothing', 'documents', 'accessories', 'other'];
const STATUSES = ['lost', 'found', 'claimed'];
const objectId = Joi.string().hex().length(24); // shape of a MongoDB ObjectId

const createSchema = Joi.object({
  title: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().trim().max(1000).allow(''),
  category: Joi.string().valid(...CATEGORIES),
  status: Joi.string().valid(...STATUSES),
  location: Joi.string().trim().max(200).allow(''),
  reportedBy: objectId
});

const updateSchema = Joi.object({
  title: Joi.string().trim().min(2).max(100),
  description: Joi.string().trim().max(1000).allow(''),
  category: Joi.string().valid(...CATEGORIES),
  status: Joi.string().valid(...STATUSES),
  location: Joi.string().trim().max(200).allow(''),
  reportedBy: objectId
}).min(1); // an update must change at least one field

// Only these query params are accepted as filters on GET /api/items
const filterSchema = Joi.object({
  status: Joi.string().valid(...STATUSES),
  category: Joi.string().valid(...CATEGORIES)
});

// GET /api/items
// TODO: implement per README.md section 3.
export async function getAllItems(req, res, next) {
  try {
    // TODO
    const { value: filter, error } = filterSchema.validate(req.query, { stripUnknown: true });
    if (error) return res.status(400).json({ message: error.message });

    const items = await Item.find(filter)
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ items });
  } catch (err) { next(err); }
}

// GET /api/items/:id
// TODO: implement per README.md section 3.
export async function getItem(req, res, next) {
  try {
    // TODO
    if (objectId.validate(req.params.id).error) {
      return res.status(400).json({ message: 'Invalid item id' });
    }

    const item = await Item.findById(req.params.id).populate('reportedBy', 'name email');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ item });
  } catch (err) { next(err); }
}

// POST /api/items
// TODO: implement per README.md section 3.
export async function createItem(req, res, next) {
  try {
    // TODO
    const { value, error } = createSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: error.message });

    let item;
    try {
      item = await Item.create(value);
    } catch (e) {
      if (e.code === 11000) {
        return res.status(409).json({ message: 'This item is already reported at this location' });
      }
      throw e;
    }
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/items/:id
// TODO: implement per README.md section 3.
export async function updateItem(req, res, next) {
  try {
    // TODO
    if (objectId.validate(req.params.id).error) {
      return res.status(400).json({ message: 'Invalid item id' });
    }

    const { value, error } = updateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: error.message });

    let doc;
    try {
      doc = await Item.findByIdAndUpdate(
        req.params.id,
        { $set: value },
        { new: true, runValidators: true }
      );
    } catch (e) {
      if (e.code === 11000) {
        return res.status(409).json({ message: 'This item is already reported at this location' });
      }
      throw e;
    }
    if (!doc) return res.status(404).json({ message: 'Item not found' });
    res.json({ item: doc });
  } catch (err) { next(err); }
}

// DELETE /api/items/:id
// TODO: implement per README.md section 3.
export async function deleteItem(req, res, next) {
  try {
    // TODO
    if (objectId.validate(req.params.id).error) {
      return res.status(400).json({ message: 'Invalid item id' });
    }

    const doc = await Item.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Item not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
}
