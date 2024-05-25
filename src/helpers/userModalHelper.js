import { USER_MANDATORY_FIELD } from "../constants.js";
const modalNameMapper = {
  user: USER_MANDATORY_FIELD,
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
