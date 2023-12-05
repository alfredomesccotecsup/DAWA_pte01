const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();

// Configuración de Multer para la carga de archivos
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Validar el tipo de archivo permitido (solo se permite imágenes)
  if (file.mimetype.startsWith('image/')) {
    return cb(null, true);
  }

  // Si no es el archivo una imagen, rechaza el archivo
  cb(new Error('Solo se permiten archivos de imagen.'));
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 } // Limitar el tamaño total a 10 MB y el número de archivos a 5
});

// Ruta para servir archivos estáticos (por ejemplo, archivos HTML, CSS, imágenes)
app.use(express.static('public'));

// Controlador de carga de archivos para múltiples archivos
app.post('/upload', upload.array('files', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No se ha seleccionado ningún archivo.');
  }

  const fileInfos = req.files.map(file => ({
    filename: file.filename,
    originalname: file.originalname,
    size: file.size,
    mimetype: file.mimetype
  }));

  res.send(fileInfos);
});

// Manejar errores de carga de archivos
app.use((err, req, res, next) => {
  console.error('Error al cargar el archivo:', err); // Imprimir el error en la consola del servidor
  if (err instanceof multer.MulterError) {
    res.status(400).send(`Error al cargar el archivo: ${err.message}`);
  } else {
    res.status(500).send('Error interno del servidor');
  }
});

// Puerto en el que escucha el servidor
const PORT = process.env.PORT || 3000;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
