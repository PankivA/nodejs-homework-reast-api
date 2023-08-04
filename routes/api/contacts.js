const express = require('express')

const { getAll, getById, addItem, deleteById, updateById, updateStatusContact } = require('../../controllers/controllers');
const { validateBody, validateBodyFavorite, isValidId, authenticate } = require("../../middlewares");
const { schemas } = require("../../models/contact");

const router = express.Router()


router.get("/", authenticate, getAll);

router.get("/:contactId", authenticate, isValidId, getById);

router.post("/", authenticate, validateBody(schemas.addSchema), addItem);

router.delete("/:contactId", authenticate, isValidId, deleteById);

router.put("/:contactId", authenticate, isValidId, validateBody(schemas.addSchema), updateById);

router.patch("/:contactId/favorite", authenticate, isValidId, validateBodyFavorite(schemas.updateFavoriteSchema), updateStatusContact);

module.exports = router
