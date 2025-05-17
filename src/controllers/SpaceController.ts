import { Request, Response } from 'express';
import { SpaceModel } from '../models/space.model';

// Get all spaces
export const getAllSpaces = async (req: Request, res: Response) => {
  try {
    const spaces = await SpaceModel.find();
    res.status(200).json(spaces);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching spaces', error });
  }
};

export const getSpacebyname = async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    const space = await SpaceModel.findOne({ name: name });
    if (!space) {
      return res.status(404).json({ message: 'Space not found' });
    }
    res.status(200).json(space);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching space', error });
  }
};

export const getSpaceById = async (req: Request, res: Response) => {
  const spaceId = req.params.id;
  try {
    const space = await SpaceModel.findById(spaceId);
    if (!space) {
      return res.status(404).json({ message: 'Space not found' });
    }
    res.status(200).json(space);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching space', error });
  }
};

// Create a new space
export const createSpace = async (req: Request, res: Response) => {
  const { name, location, description, amenities, capacity, roomtype } =
    req.body;
  try {
    const newSpace = new SpaceModel({
      name,
      location,
      roomtype,
      description,
      amenities,
      capacity,
    });

    const space = await newSpace.save();
    res.status(201).json(space);
  } catch (error) {
    res.status(500).json({ message: 'Error creating space', error });
  }
};

// Update a space
export const updateSpace = async (req: Request, res: Response) => {
  const spaceId = req.params.id;
  const {
    name,
    location,
    description,
    amenities,
    capacity,
    hourly_coinRate,
    daily_coinRate,
  } = req.body;
  try {
    const updatedSpace = await SpaceModel.findByIdAndUpdate(
      spaceId,
      {
        name,
        location,
        description,
        amenities,
        capacity,
        hourly_coinRate,
        daily_coinRate,
      },
      { new: true, runValidators: true }
    );

    if (!updatedSpace) {
      return res.status(404).json({ message: 'Space not found' });
    }

    res.status(200).json(updatedSpace);
  } catch (error) {
    res.status(500).json({ message: 'Error updating space', error });
  }
};

// Delete a space
export const deleteSpace = async (req: Request, res: Response) => {
  const spaceId = req.params.id;
  try {
    const deletedSpace = await SpaceModel.findByIdAndDelete(spaceId);
    if (!deletedSpace) {
      return res.status(404).json({ message: 'Space not found' });
    }
    res.status(200).json({ message: 'Space deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting space', error });
  }
};
