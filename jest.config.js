export default {
  roots: ["src"],
  transform: {
    "^.+\\.(t|j)sx?$": "esbuild-jest",
  },
  resolver: "jest-ts-webcompat-resolver",
};
