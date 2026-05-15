import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';
import { OrderDocument } from '../orders/order.schema';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private bot: TelegramBot;
  private chatIds: string[] = [];

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    const ids = this.config.get<string>('TELEGRAM_ADMIN_CHAT_ID') ?? '';
    this.chatIds = ids.split(',').map(id => id.trim()).filter(Boolean);

    if (!token || this.chatIds.length === 0) {
      this.logger.warn('Telegram not configured — notifications disabled');
      return;
    }

    this.bot = new TelegramBot(token);
    this.logger.log(`Telegram bot initialized — ${this.chatIds.length} recipient(s)`);
  }

  async notifyNewOrder(order: OrderDocument): Promise<void> {
    if (!this.bot) return;

    const itemsList = order.items
      .map((item) => {
        const header = `📦 *${item.productName} x${item.quantity}* — $${item.price}`;
        const flavors =
          item.flavors && item.flavors.length
            ? item.flavors.map((f) => `   • ${f.name} x${f.quantity}`).join('\n')
            : '';
        return flavors ? `${header}\n${flavors}` : header;
      })
      .join('\n\n');

    const message = [
      `🛒 *Nuevo pedido recibido*`,
      ``,
      `👤 *Cliente:* ${order.customerName}`,
      `📱 *Teléfono:* ${order.customerPhone}`,
      order.customerEmail ? `📧 *Email:* ${order.customerEmail}` : null,
      ``,
      itemsList,
      ``,
      `💰 *Total:* $${order.total}`,
      order.notes ? `📝 *Notas:* ${order.notes}` : null,
    ]
      .filter((line) => line !== null)
      .join('\n');

    try {
      await Promise.all(
        this.chatIds.map(id => this.bot.sendMessage(id, message, { parse_mode: 'Markdown' }))
      );
    } catch (err) {
      this.logger.error('Failed to send Telegram notification', err);
    }
  }
}
