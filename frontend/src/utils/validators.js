export const required = (v) => (!!v ? "" : "This field is required");
export const email = (v) =>
  /^\S+@\S+\.\S+$/.test(v) ? "" : "Please enter a valid email";
export const passwordStrong = (v) =>
  /(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}/.test(v)
    ? ""
    : "Min 8 chars, include upper, lower, number";
