import { Request, Response } from "express";
import { ServiceModel } from "../models/service.model";
import { sendEmailPartner } from "../utils/emailUtils";
import fs from 'fs';
import path from 'path';
//To get all the Bookings




export const getAllService = async (req: Request, res: Response) => {
  try {
    const Service = await ServiceModel.find().populate("user space");
    res.status(200).json(Service);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const sendPartnershipEmail = async (req: Request, res: Response) => {
  try {
    const sales = process.env.EMAIL_SALES || "";
    const { email, name, phone, company, message } = req.body;

    const templatePath2 = path.join(__dirname, '../utils/partner.html');
    let htmlTemplate2 = fs.readFileSync(templatePath2, 'utf8');


    const htmlContent2 = htmlTemplate2
      .replace('{{name}}', name)
      .replace('{{phone}}', phone)
      .replace('{{email}}', email)
      .replace('{{company}}', company)
      .replace('{{message}}', message)

    await sendEmailPartner(
      sales,
      "Partnership email request recieved",
      "A partnership callback request has been recieved.",
      htmlContent2
    );
    res.status(200).json({ msg: "Request sent to admin successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Internal server error3" });
  }
};



export const getServiceById = async (req: Request, res: Response) => {
  const userId = req.params.id;
  try {
    const Service = await ServiceModel.find({ user: userId }).populate(
      "user space"
    );
    if (!Service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.status(200).json(Service);
  } catch (error) {
    res.status(500).json({ message: "Error in Servicebyid", error });
  }
};

export const createService = async (req: Request, res: Response) => {
  const { name, description, rate, Date: createdAt } = req.body;
  try {
    //check if the user is an admin
    if ((req as any).user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const newService = new ServiceModel({
      name,
      description,
      rate,
      createdAt,
    });

    const createService = await newService.save();
    res.status(201).json(createService);
  } catch (error) {
    res.status(500).json({ message: "Error in create Service", error });
  }
};

export const updateServiceById = async (req: Request, res: Response) => {
  const ServiceId = req.params.id;
  const { name, description, rate, Date: createdAt } = req.body;
  try {
    //check if the user is an admin
    if ((req as any).user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const updateService = await ServiceModel.findByIdAndUpdate(
      ServiceId,
      { name, description, rate, createdAt },
      { new: true }
    );

    if (!updateService) {
      return res.status(404).json({ message: "Error in update Service" });
    }

    res.status(200).json(updateService);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error in update service controller", error });
  }
};

export const deleteServiceById = async (req: Request, res: Response) => {
  const ServiceId = req.params.id;

  try {
    //check if the user is an admin
    if ((req as any).user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const deleteService = await ServiceModel.findByIdAndDelete(ServiceId);
    if (!deleteService) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error in deleting Service controller", error });
  }
};
