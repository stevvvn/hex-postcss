'use strict';
const fs = require('fs');
const postcss = require('postcss');
const mkdirp = require('mkdirp');

module.exports = ({ app, conf, log }) => {
	const prefix = {
		url: conf.get('postcss.prefix.url', '/style'),
		local: conf.get('postcss.prefix.local', null)
	};

	function prefixRelative(path) {
		return /^\//.test(path) ? path : `${ conf.get('paths.launch') }/${ path }`;
	}

	Object.keys(prefix).forEach((key) =>
		prefix[key] = prefixRelative(prefix[key])
	);

	const pubPaths = conf.get('paths.public');
	const destPath = `${ conf.get('paths.launch') }/public${ prefix.url }`;
	const pcssOpts = conf.getOrCall('postcss.plugins', () =>
		require(prefixRelative(conf.get('postcss.configPath', 'postcss.config.js'))).plugins
	);
	const pcss = postcss(pcssOpts);
	const isDev = (/^dev/).test(conf.get('env'));

	function get(base, name) {
		const src = `${ base }/${ name }.pcss`;
		return new Promise((resolve) => {
			fs.exists(src, (res) => {
				if (!res) {
					return resolve();
				}
				fs.readFile(src, { encoding: 'utf8' }, async (err, res) => {
					if (err) {
						log.error('loading stylesheet', err);
						return resolve();
					}
					const { css } = await pcss.process(res, { from: base });
					if (!isDev) {
						fs.writeFileSync(`${ destPath }/${ name }.css`, css);
					}
					resolve(css);
				});
			});
		});
	}

	app.get(new RegExp(`${ prefix.url }/([-_/a-z]+)[.]css$`, 'i'), async (req, res, next) => {
		const css = await get(prefix.local, req.params[0]);
		if (css) {
			res.type('css').send(css);
		}
		next();
	});
};
