import fs from 'fs';
import path from 'path';

const videos = [
  {
    folder: '01_apertura',
    image: '01_alerta_critica_recursos.png',
    text: 'Proyecto 8D. En Marte, el pánico mata más rápido que la asfixia.',
    duration: 45
  },
  {
    folder: '02_problematica',
    image: '02_grafica_deficit_critico.png',
    text: 'El Reto: La escasez física provoca colapso social.',
    duration: 60
  },
  {
    folder: '03_solucion',
    image: '03_configuracion_motor_genetico.png',
    text: 'Gobernanza Paramétrica: Motor Genético + Óptimo de Pareto.',
    duration: 75
  },
  {
    folder: '04_prototipo',
    image: '04_tabla_recalibracion_dinamica.png',
    text: 'Recalibración en milisegundos. 100% Auditable.',
    duration: 60
  },
  {
    folder: '05_viabilidad',
    image: '05_desglose_periodos_sostenibilidad.png',
    text: 'Viabilidad: Despliegue ágil, bajo costo computacional, máxima confianza.',
    duration: 30
  },
  {
    folder: '06_retorno',
    image: '06_dashboard_estable_exito.png',
    text: 'De Marte a la Tierra: ODS 6 (Agua) y ODS 16 (Paz e Instituciones).',
    duration: 30
  }
];

const baseDir = path.join(process.cwd(), 'videos_pitch');
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir);
}

for (const v of videos) {
  const folderPath = path.join(baseDir, v.folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }

  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${v.folder}</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <style>
    body {
      margin: 0;
      background: #000;
      overflow: hidden;
      width: 1920px;
      height: 1080px;
      color: white;
      font-family: system-ui, sans-serif;
    }
    .bg {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background-image: url('../../capturas_8D/${v.image}');
      background-size: cover;
      background-position: center top;
      /* Animación por CSS */
      animation: pan ${v.duration}s linear infinite alternate;
      opacity: 0.5;
    }
    @keyframes pan {
      0% { transform: scale(1); filter: brightness(0.8); }
      100% { transform: scale(1.1) translate(0%, 5%); filter: brightness(1.2); }
    }
    .text-container {
      position: absolute;
      bottom: 120px;
      left: 100px;
      max-width: 1400px;
      animation: fadein 3s ease-out;
    }
    .text-title {
      font-size: 80px;
      font-weight: 900;
      letter-spacing: -1px;
      line-height: 1.1;
      text-shadow: 0 4px 20px rgba(0,0,0,1);
      margin: 0;
      background: linear-gradient(90deg, #fff, #ddd);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    @keyframes fadein {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>
  <div class="bg"></div>
  <div class="text-container">
    <h1 class="text-title">${v.text}</h1>
  </div>
  
  <script>
    // Hyperframes requiere saber la duración exacta. Le damos una línea de tiempo falsa de GSAP para que sepa cuándo detener de grabar.
    window.__timelines = window.__timelines || {};
    const tl = gsap.timeline({ paused: true });
    tl.to({}, { duration: ${v.duration} });
    window.__timelines["main"] = tl;
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(folderPath, 'index.html'), htmlContent);
  console.log(`[+] Creado y parcheado con GSAP: ${v.folder}/index.html`);
}
