import mongoose, { Document, Model } from 'mongoose';
import { ActData } from './types/index.js';

export interface ActDocument extends ActData, Document {}
export interface ActModel extends Model<ActDocument> {}

const actSchema = new mongoose.Schema<ActDocument>(
  {
    actNumber: { type: Number, required: true },
    telegramId: { type: Number, required: true, index: true },
    city: { type: String, required: true },
    restaurant: { type: String, required: true },
    fishType: { type: String, required: true },
    weightEtiketka: { type: Number, required: true },
    slicesSushi: { type: Number, required: true },
    redTrim: { type: Number, required: true },
    blackTrim: { type: Number, required: true },
    waste: { type: Number, required: true },
    calculatedWaste: { type: Number, required: true },
    division: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Уникальный составной индекс: номер акта уникален в рамках города
actSchema.index({ city: 1, actNumber: 1 }, { unique: true });
actSchema.index({ createdAt: -1 }); // Для сортировки последних актов

export const Act = mongoose.model<ActDocument, ActModel>('Act', actSchema);
