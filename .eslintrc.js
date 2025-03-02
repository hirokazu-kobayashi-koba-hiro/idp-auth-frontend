module.exports = {
  extends: ["next", "next/core-web-vitals", "eslint:recommended"],
  rules: {
    "react/react-in-jsx-scope": "off", // Not needed in Next.js
    "jsx-a11y/anchor-is-valid": "off", // If using Link from Next.js
  },
};
