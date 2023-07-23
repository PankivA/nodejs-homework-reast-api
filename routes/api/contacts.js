const express = require('express')

const { getAll, getById, addItem, deleteById, updateById, updateStatusContact } = require('../../controllers/controllers');
const { validateBody, validateBodyFavorite, isValidId } = require("../../middlewares");
const { schemas } = require("../../models/contact");

const router = express.Router()


router.get("/", getAll);

router.get("/:contactId", isValidId, getById);

router.post("/", validateBody(schemas.addSchema), addItem);

router.delete("/:contactId", isValidId, deleteById);

router.put("/:contactId", isValidId, validateBody(schemas.addSchema), updateById);

router.patch("/:contactId/favorite", isValidId, validateBodyFavorite(schemas.updateFavoriteSchema), updateStatusContact);

module.exports = router
