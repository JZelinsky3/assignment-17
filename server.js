const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");

const upload = multer({ dest: __dirname + "/public/images" });

mongoose
  .connect(
    ""
  )
  .then(() => console.log("Connected to mongodb..."))
  .catch((err) => console.error("could not connect ot mongodb...", err));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

const carSchema = new mongoose.Schema({
    make: String,
    model: String,
    year: Number,
    type: String,
    features: [String],
    img: String,
    _id: Number
});

const Car = mongoose.model("Car", carSchema);

app.get("/api/cars", (req, res) => {
    getCars(res);
});
  
const getCars = async (res) => {
    const cars = await Car.find();
    res.send(cars);
};

app.post("/api/cars", upload.single("img"), async (req, res) => {
    console.log(req.body);
    const result = validateCar(req.body);

    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

    // Hack to find new ID\
    const cars = await Car.find();
    console.log(cars);
    let maxID = 0;
    for (x = 0; x < cars.length; x++) {
        if (cars[x]._id > maxID) {
            maxID = cars[x]._id;
        }
    }
    maxID++;

    const car = new Car({
        _id: maxID,  
        make: req.body.make,
        model: req.body.model,
        year: req.body.year,
        type: req.body.type,
        features: req.body.features.split(","),
    });

    if (req.file) {
        car.img = "images/" + req.file.filename;
    }

    createCar(car, res);
});

const createCar = async (car, res) => {
    const result = await car.save();
    res.send(car);
};

app.put("/api/cars/:id", upload.single("img"), (req, res) => {
    const result = validateCar(req.body);
    
    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }
    updateCar(req, res);
});        

const updateCar = async (req, res) => {
    let fieldsToUpdate = {
        make: req.body.make,
        model: req.body.model,
        year: req.body.year,
        type: req.body.type,
        features: req.body.features.split(","),
    };

    if (req.file) {
        fieldsToUpdate.img = "images/" + req.file.filename;
    }

    const result = await Car.updateOne({ _id: req.params.id }, fieldsToUpdate);
    const car = await Car.findById(req.params.id);
    res.send(car);
};

app.delete("/api/cars/:id", upload.single("img"), (req, res) => {
    removeCar(res, req.params.id);
});

const removeCar = async (res, id) => {
    const car = await Car.findByIdAndDelete(id);
    res.send(car);
  };

const validateCar = (car) => {
    const schema = Joi.object({
        _id: Joi.allow(""),
        make: Joi.string().required(),
        model: Joi.string().required(),
        year: Joi.number().integer().required(),
        type: Joi.string().required(),
        features: Joi.allow(""),
    });

    return schema.validate(car);
};

app.listen(3000, () => {
    console.log("Running");
});