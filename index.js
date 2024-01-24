
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "blog",
  password: "2810",
  port: 5432,
});

db.connect();

const app = express();
const port = 3000;

// Configuración de Express
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');  // Configuración del motor de plantillas EJS
app.use(express.static("public"));  // Carpeta de archivos estáticos

let posts = [];  // Almacenar los posts en memoria (sin persistencia)

// Rutas
app.get('/', async(req, res) => {

  const blogs = await db.query("SELECT * FROM posts ORDER BY id DESC");
  posts = blogs.rows;
  res.render('index', { posts });
});

app.get('/edit/:id', async (req, res) => {
  const postId = req.params.id;
  const post = await db.query("SELECT * FROM posts WHERE id = ($1)", [postId]);

  if (post.rows.length === 0) {
    // Post no encontrado, puedes manejar la redirección o mostrar un mensaje de error
    res.redirect('/'); // Redirigir a la página principal
  } else {
    // Renderizar la página de edición con los detalles del post
    res.render('edit', { post: post.rows[0] });
  }
});


app.get("/about", (req, res) => {
  res.render("Acerca.ejs");
});

app.get("/contact", (req, res) => {
  res.render("contact.ejs");
});

app.post('/submit', async(req, res) => {

  const title = req.body.title;
  const content = req.body.content;

  await db.query("INSERT INTO posts (title,content) VALUES ($1,$2) RETURNING *",[title,content]);


  res.redirect('/');
});

app.post('/update/:id', async(req, res) => { //aca esta el error
  const postId = req.params.id;
  const title = req.body.title;
  const content = req.body.content;

  posts[postId] = { title, content };

  await db.query("UPDATE posts SET title = ($1),content = ($2) WHERE id = $3 RETURNING *",[title,content,postId]);

  res.redirect('/');
});

app.post('/contact', async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const coment = req.body.text;
  
  await db.query("INSERT INTO contact (name,email,coment) VALUES ($1,$2,$3) RETURNING *",[name,email,coment]);

  res.render('agradecimiento.ejs');

});
app.post('/delete/:id', async (req, res) => {
  const postId = req.params.id;

  try {
    const postIdAsInt = parseInt(postId);

    if (isNaN(postIdAsInt)) {
      res.status(400).send("ID de post no válido");
      return;
    }

    const postToDelete = await db.query("SELECT * FROM posts WHERE id = $1", [postIdAsInt]);

    if (postToDelete.rows.length === 0) {
      res.status(404).send("Post no encontrado");
    } else {
      await db.query("DELETE FROM posts WHERE id = $1", [postIdAsInt]);
      res.redirect('/');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error interno del servidor");
  }
});


app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
