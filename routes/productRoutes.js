const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductByPid,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

router.route("/").get(getProducts).post(createProduct);
router
  .route("/:pid")
  .get(getProductByPid)
  .put(updateProduct)
  .delete(deleteProduct);

module.exports = router;
