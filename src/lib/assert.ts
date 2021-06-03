const assert = (condition: any, message = "Assertion Failed") => {
  if (!condition) {
    throw new Error(message);
  }

  return true;
};

export default assert