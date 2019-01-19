# hex-postcss

Compile PostCSS in the public `public/` path(s) of your `express-hex` app on-demand.

For example, if `/your/app/public/assets/css/foo.pcss` exists, requests to `https://your-app-host/assets/css/foo.css` will return the compiled version of that file.

## Usage

In your `middleware.js`:

```javascript
module.exports = {
	// ... rest of your middleware
	'_default': {
		'deps': [ 'hex-postcss.service' /*, ... maybe more default dependencies */ ]
	}
}
```

In `conf.js`:

| param | default | purpose
|-------|---------|---------
| `postcss.prefix.url`   | `/assets/css` | Where to listen for `*.css` requests
| `postcss.prefix.local` | (prefix.url value minus initial /) | Specify when the URL prefix does not match the path in `public/` to specify a different sub-folder
| `postcss.plugins`      | `plugins` from `postcss.config.js` in your app's parent directory | If you don't have `postcss.config.js` here you must specify the plugins to use.

Example:

```javascript
{
	'postcss': {
		'prefix': {
			'url': '/static', // serve *.css from /static from .pcss files where applicable
			'local': 'pcss' // /static/foo.css -> /my-app-path/public/pcss/foo.pcss
		},
		'plugins': require('/my-app-front-end/postcss.config.js').plugins // share config with my front-end that resides elsewhere on the filesystem
	}
}
```

In development the files are recompiled on each request, which is noticeably slow. In production they are cached. You must reload the server to invalidate the cache on updates in that case.
