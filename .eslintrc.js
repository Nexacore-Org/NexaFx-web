module.exports = {
  rules: {
    "no-restricted-imports": ["error", {
      "patterns": [{
        "group": ["app/lib/api/*", "app/lib/api"],
        "message": "Please use the correct import path instead of app/lib/api."
      }]
    }]
  }
};
