const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

//validation
function isOrderValid(req, res, next) {
  const params = ["deliverTo", "mobileNumber", "dishes"];
  const input = req.body.data;
  for (field of params) {
    if (!req.body.data[field]) {
      return next({
        status: 400,
        message: `${field} is  undefined.`,
      });
    }
  }

  if (!Array.isArray(input.dishes) || input.dishes.length === 0) {
    return next({
      status: 400,
      message: `Field dish is not properly formatted.`,
    });
  }

  for (let i = 0; i < input.dishes.length; i++) {
    if (
      !input.dishes[i].quantity ||
      !Number.isInteger(input.dishes[i].quantity)
    ) {
      return next({
        status: 400,
        message: `Received input: Dish: ${i}, has an improperly formatted quantity.`,
      });
    }
  }
  next();
}

function doesOrderExist(req, res, next) {
  const orderId = req.params.orderId;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order is not found: ${req.params.orderId}`,
  });
}

//LIST
function list(req, res) {
  res.json({ data: orders });
}

//CREATE
function create(req, res) {
  const {
    data: { deliverTo, mobileNumber, dishes },
  } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status: "delivered",
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

//READ
function read(req, res) {
  res.json({ data: res.locals.order });
}

//UPDATE
function update(req, res, next) {
  const order = res.locals.order;
  const orderId = req.params.orderId;
  const {
    data: { id, status = "", deliverTo, mobileNumber, dishes },
  } = req.body;

  if (id && orderId !== id) {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
    });
  }

  if (!status || order.status === "delivered" || status === "invalid") {
    return next({
      status: 400,
      message: `Field status is improperly formatted.`,
    });
  }

  order.status = status;
  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.dishes = dishes;

  res.json({ data: order });
}

//DELETE
function destroy(req, res, next) {
  const { status } = res.locals.order;
  if (status !== "pending") {
    return next({
      status: 400,
      message: `Field status has to be pending to delete.`,
    });
  }
  res.sendStatus(204);
}

module.exports = {
  list,
  create: [isOrderValid, create],
  read: [doesOrderExist, read],
  update: [doesOrderExist, isOrderValid, update],
  delete: [doesOrderExist, destroy],
};
