import { config } from "./config/env";
import app from "./app";
import logger from "./utils/logger";

const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
  logger.info(`🌍 Environment: ${config.env}`);
  logger.info(`✅ All environment variables validated`);
});