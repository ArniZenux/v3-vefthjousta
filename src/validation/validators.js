import { body } from 'express-validator';

export const nameValidator = body('namevidburdur')
    .isLength({ min: 1, max : 64})
    .withMessage('Nafn má ekki vera tómt og hámarki vera 64 starfir');

export const commentValidator =  body('comment')
    .isLength({ min: 1, max: 400})
    .withMessage('Vantar lýsing og hámarki vera 400 starfir');
    
export const usernameValidator = body('username')
    .isLength({ min: 1, max: 64  })
    .withMessage('Notanid má ekki vera tómt og hámarki vera 64 starfir');

export const passwordValidator = body('password')
    .isLength({ min: 1, max: 256 })
    .withMessage('Lyklaorð má ekki vera tómt, hámarki 256 starfir');
