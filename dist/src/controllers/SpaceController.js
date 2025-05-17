"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSpace = exports.updateSpace = exports.createSpace = exports.getSpaceById = exports.getSpacebyname = exports.getAllSpaces = void 0;
const space_model_1 = require("../models/space.model");
// Get all spaces
const getAllSpaces = async (req, res) => {
    try {
        const spaces = await space_model_1.SpaceModel.find();
        res.status(200).json(spaces);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching spaces", error });
    }
};
exports.getAllSpaces = getAllSpaces;
const getSpacebyname = async (req, res) => {
    const { name } = req.body;
    try {
        const space = await space_model_1.SpaceModel.findOne({ name: name });
        if (!space) {
            return res.status(404).json({ message: "Space not found" });
        }
        res.status(200).json(space);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching space", error });
    }
};
exports.getSpacebyname = getSpacebyname;
const getSpaceById = async (req, res) => {
    const spaceId = req.params.id;
    try {
        const space = await space_model_1.SpaceModel.findById(spaceId);
        if (!space) {
            return res.status(404).json({ message: "Space not found" });
        }
        res.status(200).json(space);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching space", error });
    }
};
exports.getSpaceById = getSpaceById;
// Create a new space
const createSpace = async (req, res) => {
    const { name, location, description, amenities, capacity, roomtype } = req.body;
    try {
        const newSpace = new space_model_1.SpaceModel({
            name,
            location,
            roomtype,
            description,
            amenities,
            capacity
        });
        const space = await newSpace.save();
        res.status(201).json(space);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating space", error });
    }
};
exports.createSpace = createSpace;
// Update a space
const updateSpace = async (req, res) => {
    const spaceId = req.params.id;
    const { name, location, description, amenities, capacity, hourly_coinRate, daily_coinRate } = req.body;
    try {
        const updatedSpace = await space_model_1.SpaceModel.findByIdAndUpdate(spaceId, { name, location, description, amenities, capacity, hourly_coinRate, daily_coinRate }, { new: true, runValidators: true });
        if (!updatedSpace) {
            return res.status(404).json({ message: "Space not found" });
        }
        res.status(200).json(updatedSpace);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating space", error });
    }
};
exports.updateSpace = updateSpace;
// Delete a space
const deleteSpace = async (req, res) => {
    const spaceId = req.params.id;
    try {
        const deletedSpace = await space_model_1.SpaceModel.findByIdAndDelete(spaceId);
        if (!deletedSpace) {
            return res.status(404).json({ message: "Space not found" });
        }
        res.status(200).json({ message: "Space deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting space", error });
    }
};
exports.deleteSpace = deleteSpace;
