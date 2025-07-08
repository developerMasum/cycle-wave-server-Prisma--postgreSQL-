import prisma from "../../../shared/prisma";

const analyticsOrders = async () => {
  const orders = await prisma.order.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  const total = orders.length;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthOrders = orders.filter((order) => {
    const date = new Date(order.createdAt);
    return (
      date.getMonth() === currentMonth && date.getFullYear() === currentYear
    );
  });

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const lastMonthOrders = orders.filter((order) => {
    const date = new Date(order.createdAt);
    return (
      date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
    );
  });

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const lastMonthRevenue = lastMonthOrders.reduce(
    (sum, order) => sum + order.totalPrice,
    0
  );
  const currentMonthRevenue = thisMonthOrders.reduce(
    (sum, order) => sum + order.totalPrice,
    0
  );

  return {
    revenueData: {
      total: totalRevenue,
      lastMonthTotal: lastMonthRevenue,
      percentageChange:
        lastMonthRevenue === 0
          ? 100
          : ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100,
    },
    ordersData: {
      total,
      lastMonthTotal: lastMonthOrders.length,
      percentageChange:
        lastMonthOrders.length === 0
          ? 100
          : ((thisMonthOrders.length - lastMonthOrders.length) /
              lastMonthOrders.length) *
            100,
    },
    usersData: {
      total: new Set(orders.map((o) => o.user?.email)).size,
      lastMonthTotal: new Set(lastMonthOrders.map((o) => o.user?.email)).size,
      percentageChange:
        lastMonthOrders.length === 0
          ? 100
          : ((new Set(thisMonthOrders.map((o) => o.user?.email)).size -
              new Set(lastMonthOrders.map((o) => o.user?.email)).size) /
              new Set(lastMonthOrders.map((o) => o.user?.email)).size) *
            100,
    },
  };
};

const getLast12MonthsAnalyticsData = async () => {
  const orders = await prisma.order.findMany({
    include: { user: true },
  });

  const monthlyMap: Record<
    string,
    {
      orders: number;
      totalRevenue: number;
      users: Set<string>;
    }
  > = {};

  for (const order of orders) {
    const date = new Date(order.createdAt);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;

    if (!monthlyMap[month]) {
      monthlyMap[month] = { orders: 0, totalRevenue: 0, users: new Set() };
    }

    monthlyMap[month].orders += 1;
    monthlyMap[month].totalRevenue += order.totalPrice;
    monthlyMap[month].users.add(order.email);
  }

  const sortedMonths = Object.keys(monthlyMap).sort().slice(-12);

  return {
    orders: sortedMonths.map((month) => ({
      month,
      orders: monthlyMap[month].orders,
    })),
    revenue: sortedMonths.map((month) => ({
      month,
      totalRevenue: monthlyMap[month].totalRevenue,
    })),
    users: sortedMonths.map((month) => ({
      month,
      users: monthlyMap[month].users.size,
    })),
  };
};
const getTopSellingProducts = async () => {
  const result = await prisma.orderedproductDetails.groupBy({
    by: ["productId", "name"],
    _sum: {
      quantity: true,
    },
    orderBy: {
      _sum: { quantity: "desc" },
    },
    take: 10,
  });

  const products = await Promise.all(
    result.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      return {
        productId: item.productId,
        name: item.name,
        totalQuantitySold: item._sum.quantity || 0,
        totalRevenue: (product?.price || 0) * (item._sum.quantity || 0),
        images: product?.images || [],
        brand: product?.brand,
        price: product?.price,
      };
    })
  );

  return products;
};

export const AnalyticsService = {
  analyticsOrders,
  getLast12MonthsAnalyticsData,
  getTopSellingProducts,
};
