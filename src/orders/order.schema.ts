import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document & {
  items: {
    product?: Types.ObjectId;
    productName: string;
    quantity: number;
    price: number;
    flavors: { name: string; quantity: number }[];
  }[];
};

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  customerPhone: string;

  @Prop()
  customerEmail: string;

  @Prop({
    type: [
      {
        product: { type: Types.ObjectId, ref: 'Product' },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        flavors: {
          type: [{ name: { type: String }, quantity: { type: Number } }],
          default: [],
        },
      },
    ],
    required: true,
  })
  items: {
    product?: Types.ObjectId;
    productName: string;
    quantity: number;
    price: number;
    flavors: { name: string; quantity: number }[];
  }[];

  @Prop({ required: true })
  total: number;

  @Prop()
  notes: string;

  @Prop({ enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' })
  status: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
