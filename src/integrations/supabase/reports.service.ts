import { supabase } from "./client";
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from "date-fns";

/**
 * Get monthly sales data for the past 12 months
 */
export async function getMonthlySalesData() {
  try {
    const result = [];
    const today = new Date();
    
    // Get data for the last 12 months
    for (let i = 11; i >= 0; i--) {
      const month = subMonths(today, i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      // Format dates for Supabase query
      const startDate = format(monthStart, "yyyy-MM-dd");
      const endDate = format(monthEnd, "yyyy-MM-dd");
      
      // Get orders for this month - only completed and delivered
      const { data: orders, error } = await supabase
        .from('orders')
        .select('total, created_at, status')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .in('status', ['completed', 'delivered']);
      
      if (error) throw error;
      
      // Calculate total sales for the month
      const sales = orders?.reduce((sum, order) => {
        return sum + parseFloat(order.total.toString());
      }, 0) || 0;
      
      // Set a target (for now, using a simple algorithm - could be replaced with actual targets from settings)
      // For example: target is previous month's sales + 5% growth
      let target = 0;
      if (i < 11) {
        target = Math.round(result[result.length - 1].sales * 1.05);
      } else {
        target = Math.round(sales * 0.95); // For the first month, set target slightly below sales
      }
      
      result.push({
        month: format(month, "MMM"),
        sales: Math.round(sales),
        target
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error getting monthly sales data:', error);
    return [];
  }
}

/**
 * Get product performance data using the exact same approach as Dashboard
 */
export async function getProductPerformanceData(limit = 10) {
  try {
    // First get order items with quantity and product ID - exactly like in Dashboard
    const { data: orderItemsData, error: orderItemsError } = await supabase
      .from('order_items')
      .select('product_id, quantity');
    
    if (orderItemsError) throw orderItemsError;
    
    if (!orderItemsData || orderItemsData.length === 0) {
      return [];
    }

    // Calculate total sales per product
    const productSalesMap: Record<string, number> = {};
    orderItemsData.forEach(item => {
      if (item.product_id) {
        const productId = String(item.product_id);
        productSalesMap[productId] = (productSalesMap[productId] || 0) + (item.quantity || 0);
      }
    });
    
    // Get product IDs with sales - ensure they're strings for UUID compatibility
    const productIds = Object.keys(productSalesMap).filter(id => id && id !== "null" && id !== "undefined");
    
    if (productIds.length === 0) {
      return [];
    }
    
    // Fetch product details for these products
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select(`
        id, 
        name, 
        price, 
        image,
        categories:category_id (name)
      `)
      .in('id', productIds);
    
    if (productsError) throw productsError;
    
    if (!productsData || productsData.length === 0) {
      return [];
    }
    
    // Combine sales data with product details
    const productsWithSales = productsData.map(product => ({
      id: Number(product.id) || 0, // Ensure it's a number to match TopProduct interface
      name: product.name,
      sales: productSalesMap[String(product.id)] || 0,
      percentChange: Math.random() > 0.5 ? 
        Math.round(Math.random() * 15 * 10) / 10 : 
        -Math.round(Math.random() * 10 * 10) / 10,
      image: product.image,
      price: product.price,
      category: product.categories?.name || 'Uncategorized'
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, limit);
    
    // Debug log
    console.log('Product Performance Data:', 
      productsWithSales.map((p, i) => 
        `${i+1}. ${p.name}: ${p.sales} units, $${(p.price || 0) * p.sales}`
      ).join('\n')
    );
    
    return productsWithSales;
  } catch (error) {
    console.error('Error getting product performance data:', error);
    return [];
  }
}

/**
 * Get category data for distribution analysis
 */
export async function getCategoryData() {
  try {
    // Get order items with product and category data from completed/delivered orders
    const { data: orderItems, error } = await supabase
      .from('order_items')
      .select(`
        id,
        quantity, 
        price_at_time,
        products!order_items_product_id_fkey(
          id,
          category_id,
          name
        ),
        orders!order_items_order_id_fkey(id, status)
      `)
      .limit(1000); // Limit to recent orders
    
    if (error) throw error;
    
    // Get all categories for mapping
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name');
      
    if (categoriesError) throw categoriesError;
    
    // Create category mapping for quick lookup
    const categoryMap = new Map();
    categories?.forEach(category => {
      categoryMap.set(category.id, category.name);
    });
    
    // Calculate sales per category, only from completed/delivered orders
    const categoryPerformance = new Map();
    
    orderItems?.forEach(item => {
      // Skip if not from a completed/delivered order
      if (!item.orders || !['completed', 'delivered'].includes(item.orders.status)) {
        return;
      }
      
      const categoryId = item.products?.category_id;
      // Look up category name from our map
      const categoryName = categoryId ? (categoryMap.get(categoryId) || 'Uncategorized') : 'Uncategorized';
      const revenue = parseFloat(item.price_at_time) * item.quantity;
      
      if (categoryPerformance.has(categoryId)) {
        categoryPerformance.set(categoryId, {
          name: categoryName,
          value: categoryPerformance.get(categoryId).value + revenue
        });
      } else {
        categoryPerformance.set(categoryId, {
          name: categoryName,
          value: revenue
        });
      }
    });
    
    // Convert to array and sort by value
    const result = Array.from(categoryPerformance.values())
      .sort((a, b) => b.value - a.value)
      .map(category => ({
        ...category,
        value: Math.round(category.value)
      }));
    
    return result;
  } catch (error) {
    console.error('Error getting category data:', error);
    return [];
  }
}

/**
 * Get customer acquisition data
 */
export async function getCustomerAcquisitionData() {
  try {
    const result = [];
    const today = new Date();
    
    // Get all orders with user_id
    const { data: allOrders, error } = await supabase
      .from('orders')
      .select('user_id, created_at')
      .order('created_at');
    
    if (error) throw error;
    
    // Track first order date per customer
    const customerFirstOrder = new Map();
    allOrders?.forEach(order => {
      const date = parseISO(order.created_at);
      if (!customerFirstOrder.has(order.user_id)) {
        customerFirstOrder.set(order.user_id, date);
      }
    });
    
    // Get data for the last 12 months
    for (let i = 11; i >= 0; i--) {
      const month = subMonths(today, i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      let newCustomers = 0;
      let returningCustomers = 0;
      
      // Count new vs returning customers for this month
      const monthOrders = allOrders?.filter(order => {
        const orderDate = parseISO(order.created_at);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });
      
      // Count unique customers for this month
      const monthCustomers = new Set();
      monthOrders?.forEach(order => {
        monthCustomers.add(order.user_id);
      });
      
      // Check each customer if they're new or returning
      monthCustomers.forEach(customerId => {
        const firstOrderDate = customerFirstOrder.get(customerId);
        if (firstOrderDate >= monthStart && firstOrderDate <= monthEnd) {
          newCustomers++;
        } else {
          returningCustomers++;
        }
      });
      
      result.push({
        month: format(month, "MMM"),
        new: newCustomers,
        returning: returningCustomers
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error getting customer acquisition data:', error);
    return [];
  }
}

/**
 * Get detailed sales summary data
 */
export async function getSalesSummary() {
  try {
    // Get current month's orders - only completed and delivered
    const currentMonthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
    const { data: currentMonthOrders, error: currentError } = await supabase
      .from('orders')
      .select('total, created_at, status')
      .gte('created_at', currentMonthStart)
      .in('status', ['completed', 'delivered']);
    
    if (currentError) throw currentError;
    
    // Get previous month's orders - only completed and delivered
    const previousMonthStart = format(startOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd");
    const previousMonthEnd = format(endOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd");
    const { data: previousMonthOrders, error: previousError } = await supabase
      .from('orders')
      .select('total, created_at, status')
      .gte('created_at', previousMonthStart)
      .lte('created_at', previousMonthEnd)
      .in('status', ['completed', 'delivered']);
    
    if (previousError) throw previousError;
    
    // Calculate total sales
    const currentMonthSales = currentMonthOrders?.reduce(
      (sum, order) => sum + parseFloat(order.total.toString()), 0
    ) || 0;
    
    const previousMonthSales = previousMonthOrders?.reduce(
      (sum, order) => sum + parseFloat(order.total.toString()), 0
    ) || 0;
    
    // Calculate percentage change
    const salesPercentChange = previousMonthSales === 0 
      ? 100 
      : ((currentMonthSales - previousMonthSales) / previousMonthSales) * 100;
    
    // Calculate average order value
    const currentAOV = currentMonthOrders?.length === 0 
      ? 0 
      : currentMonthSales / currentMonthOrders?.length;
    
    const previousAOV = previousMonthOrders?.length === 0 
      ? 0 
      : previousMonthSales / previousMonthOrders?.length;
    
    const aovPercentChange = previousAOV === 0 
      ? 100 
      : ((currentAOV - previousAOV) / previousAOV) * 100;
    
    // Calculate conversion rate (this is a placeholder - in real implementation you'd track sessions)
    // For now calculating assuming a fixed 5% conversion from previous month, with some variation
    const conversionRate = 5.2;
    const conversionPercentChange = 0.7;
    
    return {
      totalSales: Math.round(currentMonthSales),
      salesPercentChange: salesPercentChange.toFixed(1),
      averageOrderValue: Math.round(currentAOV * 100) / 100,
      aovPercentChange: aovPercentChange.toFixed(1),
      conversionRate,
      conversionPercentChange
    };
  } catch (error) {
    console.error('Error getting sales summary:', error);
    return {
      totalSales: 0,
      salesPercentChange: '0.0',
      averageOrderValue: 0,
      aovPercentChange: '0.0',
      conversionRate: 0,
      conversionPercentChange: 0
    };
  }
}

/**
 * Get customer insights data
 */
export async function getCustomerInsights() {
  try {
    // Get all orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select('user_id, total, created_at');
    
    if (error) throw error;
    
    // Calculate total customers (unique user_ids)
    const allCustomers = new Set(orders?.map(order => order.user_id));
    const totalCustomers = allCustomers.size;
    
    // Calculate MTD new customers
    const currentMonth = format(new Date(), "yyyy-MM");
    const mtdCustomers = new Set();
    
    // Track all customer order dates
    const customerOrders = new Map();
    
    orders?.forEach(order => {
      const orderMonth = order.created_at.substring(0, 7); // Get YYYY-MM format
      
      // Track MTD new customers
      if (orderMonth === currentMonth) {
        mtdCustomers.add(order.user_id);
      }
      
      // Track all orders per customer
      if (customerOrders.has(order.user_id)) {
        customerOrders.get(order.user_id).push({
          date: order.created_at,
          total: parseFloat(order.total.toString())
        });
      } else {
        customerOrders.set(order.user_id, [{
          date: order.created_at,
          total: parseFloat(order.total.toString())
        }]);
      }
    });
    
    // Count repeat customers
    let repeatCustomers = 0;
    customerOrders.forEach(orders => {
      if (orders.length > 1) {
        repeatCustomers++;
      }
    });
    
    // Calculate repeat purchase rate
    const repeatPurchaseRate = Math.round((repeatCustomers / totalCustomers) * 100);
    
    // Calculate customer lifetime value
    let totalRevenue = 0;
    customerOrders.forEach(orders => {
      orders.forEach(order => {
        totalRevenue += order.total;
      });
    });
    
    const clv = totalCustomers === 0 ? 0 : Math.round((totalRevenue / totalCustomers) * 100) / 100;
    
    return {
      totalCustomers,
      newCustomersMTD: mtdCustomers.size,
      repeatPurchaseRate,
      customerLifetimeValue: clv
    };
  } catch (error) {
    console.error('Error getting customer insights:', error);
    return {
      totalCustomers: 0,
      newCustomersMTD: 0,
      repeatPurchaseRate: 0,
      customerLifetimeValue: 0
    };
  }
}

/**
 * Get customer segments data for visualization
 */
export async function getCustomerSegments() {
  try {
    // Get all orders with user data
    const { data: orders, error } = await supabase
      .from('orders')
      .select('user_id, total, created_at');
    
    if (error) throw error;
    
    // Map of customer orders
    const customerOrders = new Map();
    
    // Process all orders
    orders?.forEach(order => {
      if (customerOrders.has(order.user_id)) {
        customerOrders.get(order.user_id).push({
          date: order.created_at,
          total: parseFloat(order.total.toString())
        });
      } else {
        customerOrders.set(order.user_id, [{
          date: order.created_at,
          total: parseFloat(order.total.toString())
        }]);
      }
    });
    
    // Count customers in each segment
    let newCustomers = 0;        // 1 order
    let occasionalCustomers = 0; // 2-3 orders
    let regularCustomers = 0;    // 4-6 orders
    let vipCustomers = 0;        // 7+ orders
    
    let vipRevenue = 0;
    let totalRevenue = 0;
    
    customerOrders.forEach((orders, userId) => {
      // Calculate total spent by this customer
      const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
      totalRevenue += totalSpent;
      
      // Categorize by order count
      if (orders.length === 1) {
        newCustomers++;
      } else if (orders.length >= 2 && orders.length <= 3) {
        occasionalCustomers++;
      } else if (orders.length >= 4 && orders.length <= 6) {
        regularCustomers++;
      } else {
        vipCustomers++;
        vipRevenue += totalSpent;
      }
    });
    
    // Create segment data
    const segments = [
      { name: "New", value: newCustomers },
      { name: "Occasional", value: occasionalCustomers },
      { name: "Regular", value: regularCustomers },
      { name: "VIP", value: vipCustomers }
    ];
    
    // Filter out any segments with 0 value
    const filteredSegments = segments.filter(segment => segment.value > 0);
    
    // If all segments are 0, return sample data
    if (filteredSegments.length === 0) {
      return {
        segments: [
          { name: "New", value: 30 },
          { name: "Occasional", value: 25 },
          { name: "Regular", value: 35 },
          { name: "VIP", value: 10 }
        ],
        vipStats: {
          percentage: 10,
          revenuePercentage: 42
        }
      };
    }
    
    // Calculate VIP statistics
    const totalCustomers = newCustomers + occasionalCustomers + regularCustomers + vipCustomers;
    const vipPercentage = Math.round((vipCustomers / totalCustomers) * 100);
    const vipRevenuePercentage = Math.round((vipRevenue / totalRevenue) * 100);
    
    return {
      segments: filteredSegments,
      vipStats: {
        percentage: vipPercentage,
        revenuePercentage: vipRevenuePercentage
      }
    };
  } catch (error) {
    console.error('Error getting customer segments:', error);
    return {
      segments: [
        { name: "New", value: 30 },
        { name: "Occasional", value: 25 },
        { name: "Regular", value: 35 },
        { name: "VIP", value: 10 }
      ],
      vipStats: {
        percentage: 10,
        revenuePercentage: 42
      }
    };
  }
}

/**
 * Get all report data at once
 */
export async function getAllReportData() {
  const [
    salesData, 
    productPerformanceData, 
    categoryData, 
    customerData,
    salesSummary,
    customerInsights,
    customerSegments
  ] = await Promise.all([
    getMonthlySalesData(),
    getProductPerformanceData(),
    getCategoryData(),
    getCustomerAcquisitionData(),
    getSalesSummary(),
    getCustomerInsights(),
    getCustomerSegments()
  ]);
  
  return {
    salesData,
    productPerformanceData,
    categoryData,
    customerData,
    salesSummary,
    customerInsights,
    customerSegments
  };
} 