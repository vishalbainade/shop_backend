const pool = require("../config/db");

// Get all products
const getAllProducts = async () => {
  const result = await pool.query("SELECT * FROM products ORDER BY id ASC");
  return result.rows;
};

// Get all products using a database function
const getAllProductsFunction = async () => {
  const result = await pool.query("SELECT * FROM get_all_products()");
  return result.rows;
};

// Get a product by ID
const getProductById = async (id) => {
  const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
  return result.rows[0];
};

// Add a new product
const addProduct = async ({
  name,
  description,
  old_price,
  discount_price,
  discount,
  category,
  parent_category,
  sub_category,
  stock,
  image,
  size,
  color,
  quantity
}) => {
  const result = await pool.query(
    `INSERT INTO products (
      name, description, old_price, discount_price, discount,
      category, parent_category, sub_category, stock,
      image, size, color, quantity
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9,
      $10, $11, $12, $13
    ) RETURNING *`,
    [
      name,
      description,
      old_price,
      discount_price,
      discount,
      category,
      parent_category,
      sub_category,
      stock,
      image,
      size,
      color,
      quantity
    ]
  );
  return result.rows[0];
};

// Update a product by ID
const updateProduct = async (id, data) => {
  const result = await pool.query(
    `UPDATE products SET 
      name = $1,
      description = $2,
      old_price = $3,
      discount_price = $4,
      discount = $5,
      category = $6,
      parent_category = $7,
      sub_category = $8,
      stock = $9,
      image = $10,
      size = $11,
      color = $12,
      quantity = $13
     WHERE id = $14 RETURNING *`,
    [
      data.name,
      data.description,
      data.old_price,
      data.discount_price,
      data.discount,
      data.category,
      data.parent_category,
      data.sub_category,
      data.stock,
      data.image,
      data.size,
      data.color,
      data.quantity,
      id
    ]
  );
  return result.rows[0];
};

// Delete a product by ID
const deleteProduct = async (id) => {
  await pool.query("DELETE FROM products WHERE id = $1", [id]);
};

// Get products by category, parent category, and sub-category
const getProductsByCategory = async (category, parent_category, sub_category) => {
  const result = await pool.query(
    `SELECT * FROM products 
     WHERE LOWER(category) = LOWER($1) 
     AND LOWER(parent_category) = LOWER($2) 
     AND LOWER(sub_category) = LOWER($3)`,
    [category, parent_category, sub_category]
  );
  return result.rows;
};

// Search products by name (case-insensitive)
const searchProducts = async (keyword) => {
  const result = await pool.query(
    "SELECT * FROM products WHERE name ILIKE '%' || $1 || '%'",
    [keyword]
  );
  return result.rows;
};

module.exports = {
  getAllProducts,
  getAllProductsFunction,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProducts
};
