const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Path to Next.js app to load next.config.js and env variables
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "node", // Our tests check API services and crypto helpers
  moduleNameMapper: {
    // Handle path aliases
    "^@/(.*)$": "<rootDir>/$1",
  },
};

module.exports = createJestConfig(customJestConfig);
