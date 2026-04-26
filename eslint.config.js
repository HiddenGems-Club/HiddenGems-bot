const js = require("@eslint/js");

module.exports = [
    js.configs.recommended,
    {
        rules: {
            "no-trailing-spaces": "error",
            "no-mixed-spaces-and-tabs": "error",
            "indent": ["error", 4],
            "quotes": ["error", "double"],
            "semi": ["error", "always"],
            "no-unused-vars": "warn",
            "eol-last": ["error", "always"]
        }
    }
];
