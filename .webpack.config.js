// define child rescript
module.exports = config => {
    config.node.__dirname = false;
    config.target = 'electron-renderer';
    return config;
}
