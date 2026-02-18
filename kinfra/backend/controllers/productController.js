const Product = require('../models/Product');


const getProducts = async (req, res) => {
    try {
        const { search } = req.query;
        let query = { createdBy: req.user._id };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const products = await Product.find(query).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error('Get products error:', error.message);
        res.status(500).json({ message: 'Server error fetching products' });
    }
};

const createProduct = async (req, res) => {
    const { name, description, price, quantity } = req.body;

    if (!name || price === undefined || price === null) {
        return res.status(400).json({ message: 'Name and price are required' });
    }

    try {
        const product = await Product.create({
            name,
            description,
            price,
            quantity: quantity || 0,
            createdBy: req.user._id,
        });
        res.status(201).json(product);
    } catch (error) {
        console.error('Create product error:', error.message);
        res.status(500).json({ message: 'Server error creating product' });
    }
};


const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Ensure user owns the product
        if (product.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this product' });
        }

        const { name, description, price, quantity } = req.body;
        product.name = name ?? product.name;
        product.description = description ?? product.description;
        product.price = price ?? product.price;
        product.quantity = quantity ?? product.quantity;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        console.error('Update product error:', error.message);
        res.status(500).json({ message: 'Server error updating product' });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Ensure user owns the product
        if (product.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this product' });
        }

        await product.deleteOne();
        res.json({ message: 'Product removed successfully' });
    } catch (error) {
        console.error('Delete product error:', error.message);
        res.status(500).json({ message: 'Server error deleting product' });
    }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };
