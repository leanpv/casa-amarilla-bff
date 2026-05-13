import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './order.schema';
import { CreateOrderDto } from './create-order.dto';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly telegramService: TelegramService,
  ) {}

  async create(dto: CreateOrderDto): Promise<OrderDocument> {
    const order = await this.orderModel.create(dto as any);
    await this.telegramService.notifyNewOrder(order);
    return order;
  }

  findAll(): Promise<OrderDocument[]> {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }
}
