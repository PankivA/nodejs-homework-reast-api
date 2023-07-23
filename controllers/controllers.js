const {Contact} = require("../models/contact");

const { HttpError, wrapper } = require("../helpers");

const getAll = async (req, res) => {
  const result = await Contact.find();
  res.json(result);
};

const getById = async (req, res) => {
  const { contactId } = req.params;
  const result = await Contact.findById(contactId);
  if (!result) {
    throw new HttpError(404, "Not found");
  }
  res.json(result);
};

const addItem = async (req, res) => {
  const result = await Contact.create(req.body);
    res.status(201).json(result);
};

const deleteById = async (req, res) => {
  const { contactId } = req.params;
  const result = await Contact.findByIdAndRemove(contactId);
  if (!result) {
    throw new HttpError(404, "Not found");
  }
  res.json({
    message: "Contact deleted",
  });
};

const updateById = async (req, res) => {

  const { contactId } = req.params;
  const result = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });
  
  if (!result) {
    throw new HttpError(404, "Not found");
  }
  res.json(result);
};

const updateStatusContact = async (req, res) => {

  const { contactId } = req.params;
   const result = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });
  
  if (!result) {
    throw new HttpError(404, "Not found");
  }
  res.json(result);
};

module.exports = {
  getAll: wrapper(getAll),
  getById: wrapper(getById),
  addItem: wrapper(addItem),
  deleteById: wrapper(deleteById),
  updateById: wrapper(updateById),
  updateStatusContact: wrapper(updateStatusContact),
};