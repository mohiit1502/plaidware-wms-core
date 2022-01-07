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

const LevelPositions = [
  "LDB",
  "LDF",
  "LUB",
  "LUF",
  "RDB",
  "RDF",
  "RUB",
  "RUF",
];

const InventoryScopes = ["Inventory", "WidgetFamily", "Item"];

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

const SublevelInventoryTypes = ["Inventory", "WidgetFamily", "Item"];

const AUTHENTICATION_FAILURE_ERROR_MESSAGE = "Authentication Failed!";
const AUTHORIZATION_FAILURE_ERROR_MESSAGE =
  "User not permitted due to lack of access!";

const SubLevelTypes = ["POSITION", "BIN", "PALLET"];

const ItemTransactionTypes = [
  "PUT",
  "PICK",
  "RESERVE",
  "CHECK-IN",
  "CHECK-OUT",
  "RESERVE"
];

module.exports = {
  UserActions,
  InventoryScopes,
  WarehouseScopes,
  InventoryTypes,
  CustomAttributeTypes,
  SublevelInventoryTypes,
  SubLevelTypes,
  LevelPositions,
  SUPER_ADMIN_ROLE: "super-admin",
  COMPANY_ADMIN_ROLE: "company-admin",
  WAREHOUSE_ADMIN_ROLE: "warehouse-admin",
  ZONE_ADMIN_ROLE: "zone-admin",
  AREA_ADMIN_ROLE: "area-admin",
  AUTHENTICATION_FAILURE_ERROR_MESSAGE,
  AUTHORIZATION_FAILURE_ERROR_MESSAGE,
  ItemTransactionTypes,
};
