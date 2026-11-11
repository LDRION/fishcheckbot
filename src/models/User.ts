import mongoose, { Document, Model } from 'mongoose';
import { UserData } from './types/index.js';

// Интерфейс для Mongoose документа
export interface UserDocument extends UserData, Document {}
export type UserModel = Model<UserDocument>;

// Определение схемы
const userSchema = new mongoose.Schema<UserDocument>(
  {
    telegramId: { type: Number, required: true, unique: true, index: true },
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String },
    fullName: { type: String, required: true },
    city: { type: String },
    restaurant: { type: String },
    isAdmin: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    temp: { type: mongoose.Schema.Types.Mixed, default: {} },
    lastGreetingDate: { type: Date },
  },
  { timestamps: true }
);

// Индексы для ускорения поиска
userSchema.index({ isApproved: 1, isAdmin: 1 });

export const User = mongoose.model<UserDocument, UserModel>('User', userSchema);
