export class BaseService {
  protected logger = console;

  log(message: string, data?: any): void {
    this.logger.log(message, data);
  }

  error(message: string, err?: any): void {
    this.logger.error(message, err);
  }

  warn(message: string, data?: any): void {
    this.logger.warn(message, data);
  }
}
