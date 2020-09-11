class AppError extends Error {
  constructor(message, statusCude) {
    super(message);
    this.message = message;
    this.statusCude = String(statusCude).startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
