# IFU Static Mirror

This is a static mirror of the captured `internationalfarmunion.com` WordPress export. It is intended to preserve the live `/home/` page appearance as closely as possible without running WordPress, PHP, or a database.

The build copies the exported HTML, theme assets, plugin assets, uploads, CSS, and JavaScript into `dist/`, then adds `dist/home/index.html` so the copied homepage is available at `/home/`.

## Commands

```sh
npm run build
npm run serve
```

The serve command publishes `dist/` at:

```text
http://localhost:8080
```

## Deployment

Deploy the `dist/` directory to a static host.

Some paths still contain WordPress-style names such as `wp-content` because they are now just static asset folders. Dynamic behavior from WordPress plugins may not work unless it was already captured as static HTML/CSS/JS or is backed by a separate live service.
