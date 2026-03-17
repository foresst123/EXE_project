import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../services/productService.js";

export const listProducts = async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 8);
  const search = req.query.search || "";
  const category = (req.query.category || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const author = (req.query.author || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const products = await getProducts({ page, limit, search, category, author });
  res.json(products);
};

export const getProduct = async (req, res) => {
  const product = await getProductById(req.params.id);
  res.json(product);
};

export const createProductHandler = async (req, res) => {
  const product = await createProduct(req.body);
  res.status(201).json(product);
};

export const updateProductHandler = async (req, res) => {
  const product = await updateProduct(req.params.id, req.body);
  res.json(product);
};

export const deleteProductHandler = async (req, res) => {
  const result = await deleteProduct(req.params.id);
  res.json(result);
};
