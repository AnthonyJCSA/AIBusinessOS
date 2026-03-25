type LogLevel = 'info' | 'warn' | 'error'

function log(level: LogLevel, module: string, message: string, meta?: Record<string, unknown>) {
  const ts = new Date().toISOString()
  const prefix = `[${ts}] [${module}]`
  // meta nunca debe contener tokens, payloads completos ni datos sensibles
  const output = meta ? `${prefix} ${message} ${JSON.stringify(meta)}` : `${prefix} ${message}`
  if (level === 'error') console.error(output)
  else if (level === 'warn') console.warn(output)
  else console.log(output)
}

export function createLogger(module: string) {
  return {
    info:  (msg: string, meta?: Record<string, unknown>) => log('info',  module, msg, meta),
    warn:  (msg: string, meta?: Record<string, unknown>) => log('warn',  module, msg, meta),
    error: (msg: string, meta?: Record<string, unknown>) => log('error', module, msg, meta),
  }
}
