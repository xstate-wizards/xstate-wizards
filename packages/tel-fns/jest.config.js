module.exports = {
  bail: true,
  preset: "ts-jest",
  moduleDirectories: ["node_modules"],
  roots: ["./src"],
  testPathIgnorePatterns: ["/node_modules/"],
};
