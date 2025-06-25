module.exports = {
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/jest-setup.js"],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
};
