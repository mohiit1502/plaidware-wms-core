const db = require("./connect");
const UserPermission = require("../../models/UserPermission");
const { AllUIModules } = require("../constants");
(async () => {
  await db.connect();
  for (const UIModule of AllUIModules) {
    const modulePermission = await UserPermission.findOne({ name: UIModule, allowedUIModules: [UIModule] });
    if (!modulePermission) {
      await UserPermission.create({ name: UIModule, allowedUIModules: [UIModule] });
    }
  }
  process.exit(1);
})();
