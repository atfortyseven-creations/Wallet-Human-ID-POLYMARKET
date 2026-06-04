const fs = require('fs');
const path = require('path');

console.log('================================================');
console.log('  SOVEREIGN ASSET INJECTOR (OMEGA PROTOCOL) ');
console.log('================================================');

const brainDir = path.resolve('C:\\Users\\admin\\.gemini\\antigravity\\brain\\e3f69baf-e215-4f39-8253-264bda5fdd8e');
const publicDir = path.resolve(__dirname, 'public');

if (!fs.existsSync(publicDir)) {
    console.error(' FATAL: /public directory not found.');
    process.exit(1);
}

// Escaneamos el cerebro de la IA para buscar tus imagenes adjuntas
fs.readdir(brainDir, (err, files) => {
    if (err) {
        console.error(' Error leyendo el directorio AGI:', err);
        return;
    }

    const jpgs = files.filter(f => f.endsWith('.jpg')).sort();
    
    if (jpgs.length < 2) {
        console.error(` Necesitamos 2 archivos .jpg en el cerebro. Solo encontramos: ${jpgs.length}`);
        return;
    }

    // La lógica dicta que la primera adjunta (Olas Azules) es la imagen 1, 
    // y la segunda adjunta (Olas Lineales) es la imagen 2
    // Extraemos las más recientes basadas en timestamp (los nombres tienen el timestamp)
    const recentJpgs = jpgs.slice(-2); // Tomamos los últimos 2 si hay más

    const downheadSource = path.join(brainDir, recentJpgs[0]);
    const iosAndroidSource = path.join(brainDir, recentJpgs[1]);

    const downheadTarget = path.join(publicDir, 'downhead-hq.jpg');
    const iosAndroidTarget = path.join(publicDir, 'ios-android-hq.jpg');

    try {
        fs.copyFileSync(downheadSource, downheadTarget);
        console.log(` [SUCCESS] Inyectado asset 1: downhead-hq.jpg (Blue Waves) => ${downheadTarget}`);
        
        fs.copyFileSync(iosAndroidSource, iosAndroidTarget);
        console.log(` [SUCCESS] Inyectado asset 2: ios-android-hq.jpg (Line Waves) => ${iosAndroidTarget}`);

        console.log('================================================');
        console.log(' TODO LISTO. Los fondos ultra HQ están ahora en el sistema.');
        console.log(' RECARGA LA PÁGINA (F5) EN LOCALHOST PARA VER EL AZTEC BRUTALIST UI.');
    } catch (e) {
        console.error(' Error crítico inyectando assets:', e);
    }
});
