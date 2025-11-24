const path = require("path");
const fs = require("fs");
const webpack = require("webpack");

const packageConfig = require("./package.json");
const pluginConfig = require("./src/config.json");
pluginConfig.version = packageConfig.version;

const metaComment = (() => {
    const lines = ["/**"];
    for (const configKey in pluginConfig) {
        lines.push(` * @${configKey} ${pluginConfig[configKey]}`);
    }
    lines.push(" */");

    return lines.join("\n");
})();

module.exports = {
    mode: "development",
    target: "node",
    devtool: false,
    entry: "./src/index.js",
    output: {
        filename: "TankSquadCall.plugin.js",
        path: path.join(__dirname, "dist"),
        libraryTarget: "commonjs2",
        libraryExport: "default",
        compareBeforeEmit: false
    },
    resolve: {
        extensions: [
            ".js",
            ".jsx",
            ".css"
        ],
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: "raw-loader"
            },
            {
                test: /\.jsx$/,
                exclude: /node_modules/,
                use: "babel-loader"
            },
            {
                test: /\.(png|jpg|gif|webp)$/i,
                use: "url-loader"
            },
        ]
    },
    plugins: [
        new webpack.BannerPlugin({raw: true, banner: metaComment}),
        {
            apply: (compiler) => {
                compiler.hooks.assetEmitted.tap("TankSquadCall Plugin Copy", (filename, info) => {
                    const userHomeDirectory = (() => {
                        if (process.platform === "win32")  {
                            return process.env.APPDATA;
                        }

                        if (process.platform === "darwin") {
                            return path.join(process.env.HOME, "Library", "Application Support");
                        }

                        if (process.env.XDG_CONFIG_HOME) {
                            return process.env.XDG_CONFIG_HOME;
                        }

                        return path.join(process.env.HOME, "Library", ".config");
                    })();
                    const betterDiscordFolder = path.join(userHomeDirectory, "BetterDiscord");

                    fs.copyFileSync(info.targetPath, path.join(betterDiscordFolder, "plugins", filename));

                    console.log(`\n\n✅ Copied to BetterDiscord folder\n`);
                });
            }
        }
    ]
};