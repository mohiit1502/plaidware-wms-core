const mongoose = require("mongoose");

module.exports = {
  getScopes: async (scopes, searchSet) => {
    const verifiedScopes = [];
    if (scopes !== undefined && Array.isArray(scopes)) {
      for (const scope of scopes) {
        if (mongoose.isValidObjectId(scope.id)) {
          if (scope.type !== undefined && searchSet.includes(scope.type)) {
            const model = require(`../../models/${scope.type}`);
            const inventoryObject = await model.findById(scope.id);
            if (inventoryObject == undefined) {
              continue;
            }
            verifiedScopes.push({
              id: inventoryObject._id,
              type: scope.type,
            });
          }
        } else {
          throw new Error(`invalid data format for object-id - ${scope.id}`);
        }
      }
    }
    return verifiedScopes;
  },
};
