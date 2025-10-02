// models/Destination.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IDestination extends Document {
  name: string;
  country: string;
  description: string;
  imageId: string; // MongoDB GridFS file ID
}

const DestinationSchema = new Schema<IDestination>(
  {
    name: { type: String, required: true },
    country: { type: String, required: true },
    description: { type: String, required: true },
    imageId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Destination ||
  mongoose.model<IDestination>("Destination", DestinationSchema);
