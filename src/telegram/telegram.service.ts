import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';
import { OrderDocument } from '../orders/order.schema';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private bot: TelegramBot;
  private adminChatId: string = '';

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    this.adminChatId = this.config.get<string>('TELEGRAM_ADMIN_CHAT_ID') ?? '';

    if (!token || !this.adminChatId) {
      this.logger.warn('Telegram not configured — notifications disabled');
      return;
    }

    this.bot = new TelegramBot(token);
    this.logger.log('Telegram bot initialized');
  }

  async notifyNewOrder(order: OrderDocument): Promise<void> {
    if (!this.bot) return;

    const itemsList = order.items
      .map((i) => `  • ${i.productName} x${i.quantity} — $${i.price * i.quantity}`)
      .join('\n');

    const message = [
      `🛒 *Nuevo pedido recibido*`,
      ``,
      `👤 *Cliente:* ${order.customerName}`,
      `📱 *Teléfono:* ${order.customerPhone}`,
      order.customerEmail ? `📧 *Email:* ${order.customerEmail}` : null,
      ``,
      `📦 *Productos:*`,
      itemsList,
      ``,
      `💰 *Total:* $${order.total}`,
      order.notes ? `📝 *Notas:* ${order.notes}` : null,
    ]
      .filter((line) => line !== null)
      .join('\n');

    try {
      await this.bot.sendMessage(this.adminChatId, message, { parse_mode: 'Markdown' });
    } catch (err) {
      this.logger.error('Failed to send Telegram notification', err);
    }
  }
}
