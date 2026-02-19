import amqp from 'amqplib';
import { config } from '../config';
import { logger } from '../utils/logger';

interface AmqpConnection {
  createChannel(): Promise<AmqpChannel>;
  close(): Promise<void>;
}

interface AmqpChannel {
  assertExchange(
    exchange: string,
    type: string,
    options: { durable: boolean }
  ): Promise<void>;
  assertQueue(queue: string, options: { durable: boolean }): Promise<void>;
  bindQueue(queue: string, exchange: string, routingKey: string): Promise<void>;
  consume(
    queue: string,
    onMessage: (msg: AmqpMessage | null) => void,
    options: { noAck: boolean }
  ): Promise<void>;
  ack(msg: AmqpMessage): void;
  nack(msg: AmqpMessage, allUpTo: boolean, requeue: boolean): void;
  publish(
    exchange: string,
    routingKey: string,
    content: Buffer,
    options: { persistent: boolean }
  ): void;
  close(): Promise<void>;
}

interface AmqpMessage {
  content: Buffer;
}

export class MessageQueueService {
  private connection: AmqpConnection | null = null;
  private channel: AmqpChannel | null = null;

  async connect(): Promise<void> {
    try {
      this.connection = (await amqp.connect(
        config.rabbitmq.url
      )) as unknown as AmqpConnection;
      this.channel = await this.connection.createChannel();

      if (!this.channel) {
        throw new Error('Failed to create channel');
      }

      await this.channel.assertExchange(config.rabbitmq.exchange, 'topic', {
        durable: true,
      });

      await this.channel.assertQueue(config.rabbitmq.queue, {
        durable: true,
      });

      await this.channel.bindQueue(
        config.rabbitmq.queue,
        config.rabbitmq.exchange,
        'language.detection.#'
      );

      logger.info('Message queue connected', {
        exchange: config.rabbitmq.exchange,
        queue: config.rabbitmq.queue,
      });
    } catch (error) {
      logger.error('Failed to connect to message queue', { error });
      throw error;
    }
  }

  async setupConsumers(): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    await this.channel.consume(
      config.rabbitmq.queue,
      async (msg: AmqpMessage | null) => {
        if (!msg) return;

        try {
          const content = JSON.parse(msg.content.toString()) as unknown;
          logger.info('Received message', { content });

          // Process the message (implement your business logic)
          await this.processMessage(content);

          // Acknowledge the message
          this.channel!.ack(msg);
        } catch (error) {
          logger.error('Failed to process message', { error });
          // Reject and requeue the message
          this.channel!.nack(msg, false, true);
        }
      },
      { noAck: false }
    );

    logger.info('Message consumers set up');
  }

  async publish(routingKey: string, message: unknown): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    this.channel.publish(
      config.rabbitmq.exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );

    logger.debug('Message published', { routingKey });
  }

  private async processMessage(content: unknown): Promise<void> {
    // Implement message processing logic
    // This is where you'd handle incoming detection requests from other services
    logger.info('Processing message', { content });
  }

  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }

    if (this.connection) {
      await this.connection.close();
    }

    logger.info('Message queue disconnected');
  }
}
