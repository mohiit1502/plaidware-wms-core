const UserActions = [
  "Read",
  "Add",
  "Delete",
  "Edit",
  "Pick",
  "Put Away",
  "Cycle Count",
  "Query",
  "Report",
  "Order",
  "Receive",
];

const InventoryScopes = ["Inventory", "Material", "Item"];

const WarehouseScopes = [
  "Warehouse",
  "Zone",
  "Area",
  "Bay",
  "Row",
  "Level",
  "Sublevel",
];

const InventoryTypes = [
  "Perishable",
  "Material",
  "Product",
  "Equipment",
  "Fleet",
];

const CustomAttributeTypes = [
  "Date",
  "Number",
  "Decimal",
  "String",
  "Enumerable",
];

module.exports = {
  UserActions,
  InventoryScopes,
  WarehouseScopes,
  InventoryTypes,
  CustomAttributeTypes,
};
