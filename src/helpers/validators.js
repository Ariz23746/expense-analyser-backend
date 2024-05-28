import {
  USER_MANDATORY_FIELDS,
  GROUP_MANDATORY_FIELDS,
  BUDGET_MANDATORY_FIELDS,
  CATEGORY_MANDATORY_FIELDS,
  EXPENSE_MANDATORY_FIELDS,
} from "../constants.js";

const modalNameMapper = {
  user: USER_MANDATORY_FIELDS,
  group: GROUP_MANDATORY_FIELDS,
  budget: BUDGET_MANDATORY_FIELDS,
  category: CATEGORY_MANDATORY_FIELDS,
  expense: EXPENSE_MANDATORY_FIELDS,
};

const checkIfAllMandatoryFieldsExist = (modalName, requestBodyObject) => {
  try {
    const mandatoryKeys = modalNameMapper[modalName];
    const keysNotPresent = [];

    mandatoryKeys.forEach((key) => {
      if (!requestBodyObject[key]) {
        keysNotPresent.push(key);
      }
    });
    return keysNotPresent;
  } catch (error) {
    console.log("Err", error);
  }
};

export { checkIfAllMandatoryFieldsExist };
