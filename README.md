# hex-postcss

Compile and serve PostCSS on demand.

Writes CSS to your `public/` path in production to avoid redundant work, otherwise recompiles on each request.

## `conf.js`

| param | default | purpose
|-------|---------|---------
| `postcss.prefix.url`   | `/style`                         | Where to listen for `*.css` requests
| `postcss.prefix.local` | none, required                   | Path to load `.pcss` files from, either absolute or relative to your app's root
| `postcss.configPath`   | `./postcss.config` (in app root) | Config file specifying your PostCSS plugins, again absolute or relative to app root
| `postcss.plugins`      | none                             | Alternative to the config file, specify PostCSS plugins per its docs

