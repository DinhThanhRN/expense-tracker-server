class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.errorMessage = this.stack.substring(
      this.stack.search(' ') + 1,
      this.stack.search('\n'),
    );
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.contructor);
  }
}

module.exports = AppError;
