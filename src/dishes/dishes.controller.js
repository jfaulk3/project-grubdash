const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

//validation
function isDataValid(req, res, next) {
  const params = ["name", "description", "price", "image_url"];
  for (field of params) {
    if (!req.body.data[field]) {
      return next({
        status: 400,
        message: `${field} is undefined`,
      });
    }
  }
  if (req.body.data["price"] < 0) {
    return next({
      status: 400,
      message: `Field price must be a non-negative number.`,
    });
  }
  next();
}
//LIST
function list(req, res) {
  res.json({ data: dishes });
}

//CREATE
function create(req, res) {
  const {
    data: { name, description, price, image_url },
  } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function doesDishExist(req, res, next) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish is not found: ${req.params.dishId}`,
  });
}

//READ
function read(req, res) {
  res.json({ data: res.locals.dish });
}

//UPDATE
function update(req, res, next) {
  const originalDish = res.locals.dish;
  const dishId = req.params.dishId;
  const {
    data: { id, name, description, price, image_url },
  } = req.body;
  if (id && dishId !== id) {
    return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  }

  if (price === Number(price)) {
    originalDish.name = name;
    originalDish.description = description;
    originalDish.price = price;
    originalDish.image_url = image_url;
    res.json({ data: originalDish });
  }
  next({ status: 400, message: "Field price must be of type number." });
}

module.exports = {
  list,
  create: [isDataValid, create],
  read: [doesDishExist, read],
  update: [doesDishExist, isDataValid, update],
};
