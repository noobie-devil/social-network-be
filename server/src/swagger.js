// /**
//  * @swagger
//  * /register:
//  *   post:
//  *     summary: Register a new user
//  *     tags:
//  *       - User
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/UserRegister'
//  *     responses:
//  *       201:
//  *         description: The newly registered user
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/User'
//  *       400:
//  *         $ref: '#/components/responses/BadRequest'
//  *       409:
//  *         $ref: '#/components/responses/Conflict'
//  *       500:
//  *         $ref: '#/components/responses/InternalServerError'
//  */


/**
 * @swagger
 * components:
 *  schemas:
 *   User:
 *    type: Object
 *     required:
 *      - _id
 *      - firstName
 *      - lastName
 *      - email
 *      - password
 *      - picturePath
 *      - friends
 *      - status
 *      - viewProfile
 *      - createdAt
 *      - updatedAt
 *     properties:
 *      - _id:
 *          type: string
 *      - firstName:
 *          type: string
 *      - lastName:
 *          type: string
 *      - email:
 *          type: string
 *      - password:
 *          type: string
 *      - picturePath:
 *          type: string
 *      - friends:
 *          type: array
 *      - status:
 *          type: string
 *      - viewProfile:
 *          type: number
 *      - createdAt:
 *          type: number
 *      - updatedAt:
 *          type: number
 *          */

/**
 * @swagger
 * components:
 *   schemas:
 *       RegisterSchema:
 *           type: Object
 *               required:
 *                   - firstName
 *                   - lastName
 *                   - email
 *                   - password
 *               properties:
 *                   firstName:
 *                       type: string
 *                   lastName:
 *                       type: string
 *                   email:
 *                       type: string
 *                   password:
 *                       type: string
 *                       */

/**
 * @swagger
 * tags:
 *  name: Auth
 *  description:
 *  */

/**
 * @swagger
 * /api/v1/register:
 *   post:
 *     summary: Register a new user
 *     tags: [RegisterSchema]
 *     responses:
 *       201:
 *         description: The newly registered user
 *         content:
 *           application/json:
 *             schema:
 *              type: array
 *              items:
 *               $ref: '#/components/schemas/User'
 */
