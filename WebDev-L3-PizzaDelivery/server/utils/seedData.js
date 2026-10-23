const User = require("../models/User");
const InventoryItem = require("../models/InventoryItem");
const Pizza = require("../models/Pizza");

const seedDatabase = async () => {
  try {
    console.log("[Database Seeder] Checking database records...");

    const adminEmail = process.env.ADMIN_EMAIL || "admin@slicecraft.com";
    const adminExists = await User.findOne({ email: adminEmail.toLowerCase() });

    if (!adminExists) {
      await User.create({
        name: "SliceCraft Admin Master",
        email: adminEmail.toLowerCase(),
        password: "Admin@12345",
        role: "admin",
        isVerified: true,
      });
      console.log(
        `[Database Seeder] Created default Admin account: ${adminEmail} (Password: Admin@12345)`,
      );
    }

    const inventoryCount = await InventoryItem.countDocuments();
    if (inventoryCount === 0) {
      const allInventory = [
        ...defaultBases,
        ...defaultSauces,
        ...defaultCheeses,
        ...defaultVegetables,
      ];
      await InventoryItem.insertMany(allInventory);
      console.log(
        `[Database Seeder]  Inserted ${allInventory.length} inventory items (5 Bases, 5 Sauces, 5 Cheeses, 8 Vegetables).`,
      );
    }

    const pizzaCount = await Pizza.countDocuments();
    if (pizzaCount === 0) {
      await Pizza.insertMany(defaultPresetPizzas);
      console.log(
        `[Database Seeder]  Inserted ${defaultPresetPizzas.length} preset artisan pizza varieties.`,
      );
    }

    console.log("[Database Seeder] Database check & seeding complete.");
  } catch (error) {
    console.error(
      "[Database Seeder Error] Failed to seed database:",
      error.message,
    );
  }
};

module.exports = seedDatabase;
