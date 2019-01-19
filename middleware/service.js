'use strict';
const fs = require('fs');
const postcss = require('postcss');

module.exports = ({ app, conf }) => {
	const prefix = {
		'url': conf.get('postcss.prefix.url', '/assets/css'),
		'local': conf.get('postcss.prefix.local', null)
	};
	if (!prefix.local) {
		prefix.local = prefix.url;
	}
	const pubPaths = conf.get('paths.public');
	const pcssOpts = conf.getOrCall('postcss.plugins', () => require(`${ conf.get('paths.launch') }/postcss.config.js`).plugins);
	const pcss = postcss(pcssOpts);
	const isDev = (/^dev/).test(conf.get('env'));

	const cache = {};
	const get = async (path) => {
		if (!isDev && cache[path] !== undefined) {
			return cache[path];
		}
		let rv = null;
		for (let idx = 0; idx < pubPaths.length; ++idx) {
			const fullPath = `${ pubPaths[idx] }${ path }`;
			if (await new Promise((resolve) => {
				fs.access(fullPath, fs.constants.R_OK, (err) =>
					resolve(!err)
				);
			})) {
				rv = fullPath;
				break;
			}
		}
		if (rv) {
			rv = await new Promise((resolve, reject) =>
				fs.readFile(rv, async (err, css) => {
					if (err) {
						return reject(err);
					}
					resolve((await pcss.process(css, { 'from': rv })).css);
				})
			);
		}
		if (!isDev) {
			cache[path] = rv;
		}
		return rv;
	};

	app.get(new RegExp(`${ prefix.url }([-_/a-z]+)[.]css$`, 'i'), async (req, res, next) => {
		const css = await get(`${ prefix.local }${ req.params[0] }.pcss`);
		if (css) {
			res.type('css').send(css);
		}
		next();
	});
};
