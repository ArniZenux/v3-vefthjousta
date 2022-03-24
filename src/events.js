import express from 'express';
//import { ensureLoggedIn } from './login.js';

import { listApp, insertApp } from './db.js';
import { catchErrors } from './utils.js';

export const router = express.Router();

async function index(req, res) {
  //const validated = req.isAuthenticated();
  const title = 'Viðburðasíðan';

  const sqlVidburdur = `
    SELECT 
      *
    FROM 
      vidburdur
  `;
  
  const events = await listApp(sqlVidburdur);
  const registrations = [];
  const user = { req };
  const errors = [];
  
  /*const output = JSON.stringify({
    title,
    events,
    validated
  });*/
  
  //return res.render('index', {errors, events, registrations, title, user,  admin: false, validated });
  return res.json(events); 
}

/**     
 *  GET - Ná ein viðburð undir admin og birta uppfæra-siðu
 */

async function getVidburdur(req, res){
  const { id } = req.params;
  const title = 'Viðburðasíðan';
  //const validated = req.isAuthenticated();
  const user = { req };

  const sql = `
    SELECT namevidburdur, description FROM 
      vidburdur 
    WHERE 
      vidburdur.id = $1;
    `;

  const sqlUser = `
    SELECT nameskra, comment 
    FROM 
      vidburdur, skraning 
    WHERE 
      vidburdur.id=skraning.eventid 
    AND 
      vidburdur.id = $1
    `;

  const errors = [];
  const formData = [];

  try {
    const items = await listApp(sql, [id]); 
    const notendur = await listApp(sqlUser, [id]); 
    
    /*res.render('vidburd', 
      { user, 
        formData, 
        errors, 
        title, 
        events, 
        rowsuser, 
        admin : true, 
        validated 
    });
    
    const output = JSON.stringify({
      title,
      events,
      validated
    });*/
    
    const output = JSON.stringify({
      items,
      notendur
    });

    //return res.json(rowsUser); 
    return res.send(output); 

  }
  catch(e){
    console.error(e); 
  }
}

/**
 *  POST - notandi skráð viðburði. 
 */
async function userPostNewEvent(req, res){
  let success = true;   
  const validated = req.isAuthenticated();
  const { user } = req; 
  const nameSlug = req.body.namevidburdur.split(' ').join('-').toLowerCase();
  const info = [req.body.namevidburdur, nameSlug, req.body.comment, user.id];

  const sqlVidburdur = `
    INSERT INTO 
      vidburdur(namevidburdur, slug, description, userid) 
    VALUES($1, $2, $3, $4);
  `;

  try {
    success = await insertApp(sqlVidburdur, info);
  }
  catch(e){
    console.error(e); 
  }

  if(success){
    return res.redirect('/admin');
  }

  return res.render('error', {validated,  title: 'Gat ekki skráð' });
}

router.get('/events', catchErrors(index));
router.get('/events/:id', catchErrors(getVidburdur));
//router.patch('/:id', getVidburdur);
//router.delete(d)
//router.post('/', catchErrors(userPostNewEvent));
//router.post('/:id/register', catchErrors(userPostEvent));