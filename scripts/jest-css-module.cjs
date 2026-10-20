// CSS modules are not compiled in Jest; each class name resolves to itself.
module.exports = new Proxy({}, {
  get: (_target, name) => (name === '__esModule' ? false : String(name)),
});
