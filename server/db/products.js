const pool = require('./pool');

// Products Functions

const getProductById = async ({ id }) => {
  try {
    const { rows } = await pool.query(
      /*sql*/ `
      SELECT * FROM products WHERE id = $1;
    `,
      [id]
    );
    return rows[0];
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    throw error;
  }
};

const createProduct = async ({ artist, description, price, image_url, genre, stock, release_id, artist_details }) => {
  try {
    // Check if the product already exists
    const {
      rows: [product],
    } = await pool.query(
      /*sql*/ `
      INSERT INTO products (artist, description, price, image_url, genre, stock, release_id, artist_details)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `,
      [artist, description, price, image_url, genre, stock, release_id, artist_details]
    );
    return product;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

const getProductsByGenre = async ({ genre }) => {
  try {
    const { rows } = await pool.query(
      /*sql*/ `
      SELECT * FROM products
      WHERE genre ILIKE $1 AND stock > 0;
    `,
      [genre]
    );
    return rows;
  } catch (error) {
    console.error('Error fetching products by genre:', error);
    throw error;
  }
};

const searchProducts = async ({ query }) => {
  try {
    const searchTerm = `%${query}%`;
    const { rows } = await pool.query(
      /*sql*/ `
      SELECT * FROM products
      WHERE (artist ILIKE $1 OR genre ILIKE $1 OR description ILIKE $1)
      AND stock > 0;
    `,
      [searchTerm]
    );
    return rows;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

module.exports = {
  getProductById,
  createProduct,
  getProductsByGenre,
  searchProducts,
};
