# Getting Started with Create React App

## Cambios de administración y despliegue

- El nombre global de la plataforma y el WhatsApp de soporte se configuran desde el panel del desarrollador.
- Cada barbería y perfil independiente tiene un código público visible en el panel del desarrollador. El cliente puede buscar ese código para abrir únicamente ese establecimiento.
- Los bloqueos de agenda de un administrador se guardan por sede. El desarrollador puede pausar la licencia o aplicar/quitar un bloqueo técnico de forma independiente para cada sede o perfil independiente.
- Una cuenta bloqueada solo puede solicitar su activación por WhatsApp desde la pantalla de acceso restringido.

Para desplegar desde la raíz del repositorio en Vercel, `vercel.json` compila esta aplicación y publica las funciones de `api/`.

## Configuración de Supabase y avisos de citas

1. Crea un proyecto de Supabase y ejecuta `supabase/schema.sql` en el SQL Editor.
2. Crea el usuario del desarrollador en **Authentication → Users** y confirma su correo. Copia su UUID y registra su perfil desde el SQL Editor:

   ```sql
   insert into public.user_profiles (id, role, display_name, username, tenant_id, entity_id)
   values ('UUID_DEL_USUARIO', 'developer', 'Desarrollador', 'developer', null, null);
   ```

3. Configura estas variables en Vercel. No publiques ni compartas `SUPABASE_SERVICE_ROLE_KEY`, `WHATSAPP_ACCESS_TOKEN` ni `RESEND_API_KEY`.

   | Variable | Uso |
   | --- | --- |
   | `REACT_APP_SUPABASE_URL` | URL del proyecto Supabase, incluida en el frontend |
   | `REACT_APP_SUPABASE_ANON_KEY` | Clave pública anon de Supabase, incluida en el frontend |
   | `SUPABASE_URL` | La misma URL, para las funciones del servidor |
   | `SUPABASE_ANON_KEY` | La misma clave pública, para validar sesiones |
   | `SUPABASE_SERVICE_ROLE_KEY` | Clave privada de servidor; nunca usar el prefijo `REACT_APP_` |
   | `WHATSAPP_ACCESS_TOKEN` | Token de Meta WhatsApp Cloud API |
   | `WHATSAPP_PHONE_NUMBER_ID` | ID del número de WhatsApp en Meta |
   | `WHATSAPP_API_VERSION` | Versión de Graph API habilitada en Meta, por ejemplo `v22.0` |
   | `WHATSAPP_TEMPLATE_NAME` | Nombre de una plantilla de WhatsApp aprobada |
   | `WHATSAPP_TEMPLATE_LANGUAGE` | Idioma aprobado de la plantilla, por ejemplo `es` |
   | `RESEND_API_KEY` | Clave privada de Resend |
   | `EMAIL_FROM` | Remitente verificado en Resend, por ejemplo `Agenda <citas@tudominio.com>` |
   | `APP_ORIGIN` | Dominio exacto de la aplicación en Vercel (opcional, protege el endpoint de reservas) |

4. En Meta, aprueba una plantilla de utilidad con cinco variables en el cuerpo y en este orden: nombre del barbero o establecimiento, nombre del cliente, servicio, fecha y hora. WhatsApp exige plantillas aprobadas para mensajes iniciados por la empresa.
5. Despliega de nuevo después de agregar las variables. Las cuentas antiguas que solo existían en `localStorage` deben crearse de nuevo desde el panel del desarrollador o del administrador; no se migran contraseñas locales.

El nombre global de la plataforma, el inicio de sesión, perfiles, códigos públicos, contactos y reservas nuevas usan Supabase. Los avisos se envían desde funciones de Vercel y los destinatarios se consultan en el servidor; el navegador nunca decide a qué correo o teléfono enviar. Otros módulos de demostración todavía guardan parte de su estado en `localStorage` y no se sincronizan entre dispositivos.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
