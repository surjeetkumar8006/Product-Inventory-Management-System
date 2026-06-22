const Product = require('../models/Product');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const totalProducts = await Product.countDocuments({ user: userId });

    const categories = await Product.distinct('category', { user: userId });
    const totalCategories = categories.length;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const productsAddedToday = await Product.countDocuments({
      user: userId,
      createdAt: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
    });

    // Total Inventory Value: sum of (price * quantity) of all products
    const totalValueResult = await Product.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$quantity'] } } } }
    ]);
    const totalValue = totalValueResult.length > 0 ? totalValueResult[0].total : 0;

    // Low Stock Alert Count: quantity <= stockThreshold
    const lowStockCount = await Product.countDocuments({
      user: userId,
      $expr: { $lte: ['$quantity', '$stockThreshold'] }
    });

    // Low Stock Products list (up to 5)
    const lowStockProducts = await Product.find({
      user: userId,
      $expr: { $lte: ['$quantity', '$stockThreshold'] }
    }).limit(5);
    
    // Group products by category for a chart
    const categoryData = await Product.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const formattedCategoryData = categoryData.map(c => ({
      name: c._id || 'Uncategorized',
      value: c.count
    }));

    const recentProducts = await Product.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Fetch activity logs (up to 5)
    const activityLogs = await ActivityLog.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalProducts,
      totalCategories,
      productsAddedToday,
      totalValue,
      lowStockCount,
      lowStockProducts,
      categoryData: formattedCategoryData,
      recentProducts,
      activityLogs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
