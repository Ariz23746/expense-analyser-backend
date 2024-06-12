export const DB_NAME = "Expense-Analyser";

export const USER_MANDATORY_FIELDS = [
  "username",
  "firstName",
  "password",
  "email",
  "phone",
];
export const GROUP_MANDATORY_FIELDS = ["name", "members"];
export const BUDGET_MANDATORY_FIELDS = ["amount"];
export const CATEGORY_MANDATORY_FIELDS = ["categoryBudget", "name"];
export const EXPENSE_MANDATORY_FIELDS = [
  "categoryId",
  "name",
  "description",
  "amount",
];

export const userModelKey = "user";
export const groupModelKey = "group";
export const budgetModelKey = "budget";
export const categoryModelKey = "category";
export const expenseModelKey = "expense";

export const colorArray = [
  { color: "purple", isDark: true },
  { color: "yellow", isDark: false },
  { color: "green", isDark: false },
  { color: "sky", isDark: false },
  { color: "light", isDark: false },
];
