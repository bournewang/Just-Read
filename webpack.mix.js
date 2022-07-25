let mix = require('laravel-mix');

mix.setPublicPath('./')
    // .sass('src/sass/popup.scss', 'dist/css')
    // .sass('src/sass/content.scss', 'dist/css')
    .copy("src/css", 'dist/css')
    .copy("src/icons", 'dist/icons')
    .copy("src/external-libraries", 'dist/external-libraries')
    // .copy("src/css/bootstrap5-grid.min.css", 'dist/css')
    // .copy("src/css/bootstrap5.bundle.min.css", 'dist/css')
    .copy('src/js/content.js', 'dist/js')
    // .js('src/js/popup.js', 'dist/js').vue()
    .js('src/js/main.js', 'dist/js').vue()
    .copy('src/*.js', 'dist')
    .copy('src/*.css', 'dist')
    .copy('src/*.html', 'dist')
    .copy('src/manifest.json', 'dist')
    .options({
        processCssUrls: false
    });
