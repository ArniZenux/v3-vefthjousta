import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import { format } from 'date-fns';
import passport from './lib/login.js';
import { cors } from './lib/cors.js';

import { router as adminRoute } from './api/admin.js';
import { router as eventRouter } from './api/events.js';
import { router as notandaRoute } from './api/notendur.js';


dotenv.config();

export function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

const {
  PORT: port = 8080,
  SESSION_SECRET: sessionSecret,
  DATABASE_URL: connectionString,
} = process.env;

if (!connectionString )  {
  console.error('Vantar gögn í env');
  process.exit(1);
}

const app = express();

// Sér um að req.body innihaldi gögn úr formi
app.use(cors);

app.use(express.urlencoded({ extended: true }));

const path = dirname(fileURLToPath(import.meta.url));

//app.use(express.static(join(path, '../public')));
//app.set('views', join(path, '../views'));
//app.set('view engine', 'ejs');

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  maxAge: 20 * 1000, // 20 sek
}));

app.use(passport.initialize());
app.use(passport.session());

/**
 * Hjálparfall til að athuga hvort reitur sé gildur eða ekki.
 *
 * @param {string} field Middleware sem grípa á villur fyrir
 * @param {array} errors Fylki af villum frá express-validator pakkanum
 * @returns {boolean} `true` ef `field` er í `errors`, `false` annars
 */
function isInvalid(field, errors = []) {
  // Boolean skilar `true` ef gildi er truthy (eitthvað fannst)
  // eða `false` ef gildi er falsy (ekkert fannst: null)
  return Boolean(errors.find((i) => i && i.param === field));
}

app.locals.isInvalid = isInvalid;

app.locals.formatDate = (str) => {
  let date = '';

  try {
    date = format(str || '', 'dd.MM.yyyy');
  } catch {
    return '';
  }

  return date;
};

app.use('/admin', adminRoute);
app.use('/users', notandaRoute); 
app.use('/events', eventRouter);

// eslint-disable-next-line no-unused-vars
function notFoundHandler(req, res, next) {
  //const validated = req.isAuthenticated();
  //const { user } = req;
  const title = 'Síða fannst ekki';
  res.status(404).json({ error: title });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
//  const validated = req.isAuthenticated();
  //const { user } = req;
  console.error(err);
  const title = 'Villa kom upp';
  res.status(500).json( { error : title });
}

app.use(notFoundHandler);
app.use(errorHandler);

// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
