// ==========================================
// PROYECTO FORMATIVO: GOL CUT BARBER
// EVIDENCIA: GA7-220501096-AA5-EV01
// SERVICIO WEB DE AUTENTICACIÓN (API REST)
// ==========================================

// 1. Importación de módulos necesarios
const express = require('express');
const cors = require('cors');

// 2. Inicialización de la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Middlewares (Configuraciones de seguridad y recepción de datos)
app.use(express.json()); // Permite a la API recibir datos en formato JSON
app.use(cors());         // Permite conexiones desde la app frontend de la barbería

// 4. Base de datos temporal en memoria para Gol Cut Barber
// (Aquí guardaremos temporalmente los usuarios durante las pruebas)
const usuariosBarberia = [];

/**
 * ENDPOINT 1: Registro de Usuarios / Clientes / Barberos
 * Método: POST
 * Ruta: /api/auth/registro
 */
app.post('/api/auth/registro', (req, res) => {
  // Extraemos los datos enviados en el cuerpo de la petición (body)
  const { nombre, email, password, rol } = req.body;

  // Validación: Comprobar que los campos no estén vacíos
  if (!nombre || !email || !password) {
    return res.status(400).json({
      exito: false,
      mensaje: 'Error: Nombre, correo y contraseña son obligatorios.'
    });
  }

  // Validación: Comprobar si el correo ya está registrado en la barbería
  const usuarioExistente = usuariosBarberia.find(user => user.email === email);
  if (usuarioExistente) {
    return res.status(400).json({
      exito: false,
      mensaje: 'Error: El correo electrónico ya está registrado en Gol Cut Barber.'
    });
  }

  // Crear el nuevo usuario
  const nuevoUsuario = {
    id: usuariosBarberia.length + 1,
    nombre,
    email,
    password, // En fases avanzadas se aplicará encriptación
    rol: rol || 'cliente' // Si no especifica rol, se asigna 'cliente' por defecto
  };

  // Guardar en la base de datos temporal
  usuariosBarberia.push(nuevoUsuario);

  // Respuesta de éxito al usuario
  return res.status(201).json({
    exito: true,
    mensaje: 'Registro realizado satisfactoriamente en Gol Cut Barber.',
    usuario: {
      id: nuevoUsuario.id,
      nombre: nuevoUsuario.nombre,
      email: nuevoUsuario.email,
      rol: nuevoUsuario.rol
    }
  });
});

/**
 * ENDPOINT 2: Inicio de Sesión
 * Método: POST
 * Ruta: /api/auth/login
 */
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Validación: Comprobar que ingresó correo y clave
  if (!email || !password) {
    return res.status(400).json({
      exito: false,
      mensaje: 'Error: Debe ingresar correo y contraseña.'
    });
  }

  // Búsqueda del usuario con las credenciales ingresadas
  const usuarioEncontrado = usuariosBarberia.find(
    user => user.email === email && user.password === password
  );

  // Evaluar si la autenticación fue correcta o no
  if (usuarioEncontrado) {
    return res.status(200).json({
      exito: true,
      mensaje: 'Autenticación satisfactoria. ¡Bienvenido a Gol Cut Barber!',
      usuario: {
        id: usuarioEncontrado.id,
        nombre: usuarioEncontrado.nombre,
        email: usuarioEncontrado.email,
        rol: usuarioEncontrado.rol
      }
    });
  } else {
    return res.status(401).json({
      exito: false,
      mensaje: 'Error en la autenticación: Credenciales incorrectas.'
    });
  }
});

// 5. Iniciar el servidor en el puerto 3000
app.listen(PORT, () => {
  console.log(`Servidor de Gol Cut Barber corriendo en http://localhost:${PORT}`);
});