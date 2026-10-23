const cron = require("node-cron");
const InventoryItem = require("../models/InventoryItem");
const { sendLowStockAlertEmail } = require("../config/mailer");

const checkLowStockAndAlert = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@slicecraft.com";

    const lowStockItems = await InventoryItem.find({
      $expr: { $lte: ["$stock", "$threshold"] },
    });

    if (lowStockItems.length > 0) {
      console.log(
        `[Cron Sentinel] ⚠️ Found ${lowStockItems.length} items below safety threshold. Sending alert...`,
      );
      await sendLowStockAlertEmail(adminEmail, lowStockItems);
    } else {
      console.log("[Cron Sentinel] ✅ All inventory stock levels are healthy.");
    }
  } catch (error) {
    console.error(
      "[Cron Sentinel Error] Failed to execute inventory check:",
      error.message,
    );
  }
};

const initInventoryCronJob = () => {
  const cronSchedule = process.env.CRON_SCHEDULE || "0 * * * *";

  cron.schedule(cronSchedule, () => {
    console.log(
      `[Cron Sentinel] Running scheduled inventory check (${new Date().toLocaleTimeString()})...`,
    );
    checkLowStockAndAlert();
  });

  console.log(
    `[Cron Sentinel] Automated inventory monitor scheduled with pattern: "${cronSchedule}"`,
  );
};

module.exports = {
  initInventoryCronJob,
  checkLowStockAndAlert,
};
