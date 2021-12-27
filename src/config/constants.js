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

const AUTHENTICATION_FAILURE_ERROR_MESSAGE = "Authentication Failed!";
const AUTHORIZATION_FAILURE_ERROR_MESSAGE =
  "User not permitted due to lack of access!";

const SubLevelTypes = ["POSITION", "BIN", "PALLET"];

module.exports = {
  UserActions,
  InventoryScopes,
  WarehouseScopes,
  InventoryTypes,
  CustomAttributeTypes,
  SubLevelTypes,
  SUPER_ADMIN_ROLE: "super-admin",
  COMPANY_ADMIN_ROLE: "company-admin",
  WAREHOUSE_ADMIN_ROLE: "warehouse-admin",
  ZONE_ADMIN_ROLE: "zone-admin",
  AREA_ADMIN_ROLE: "area-admin",
  AUTHENTICATION_FAILURE_ERROR_MESSAGE,
  AUTHORIZATION_FAILURE_ERROR_MESSAGE,
};
