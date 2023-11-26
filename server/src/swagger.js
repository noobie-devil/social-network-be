/**
 * @swagger
 * components:
 *  schemas:
 *      LoginRequest:
 *          type: object
 *          required:
 *              - email
 *              - password
 *          properties:
 *             email:
 *              type: string
 *             password:
 *              type: string
 *      RefreshTokenRequest:
 *          type: object
 *          required:
 *              - refreshToken
 *          properties:
 *              refreshToken:
 *                  type: string
 *      RegisterRequest:
 *          type: object
 *          required:
 *              - identityCode
 *              - firstName
 *              - lastName
 *              - email
 *              - password
 *              - homeTown
 *              - birthDate
 *              - type
 *              - details
 *          properties:
 *              identityCode:
 *                  type: string
 *              firstName:
 *                  type: string
 *              lastName:
 *                  type: string
 *              email:
 *                  type: string
 *              password:
 *                  type: string
 *              homeTown:
 *                  type: string
 *              birthDate:
 *                  type: string
 *              type:
 *                  $ref: '#components/schemas/UserType'
 *              details:
 *                  $ref: '#components/schemas/UserDetails'
 *
 *      UserType:
 *         type: integer
 *         description: The type of user. Possible values are "CollegeStudent", "Lecturer", or "Candidate"
 *         enum:
 *          - 1
 *          - 2
 *          - 3
 *      UserDetails:
 *          oneOf:
 *              - $ref: '#/components/schemas/CollegeStudent'
 *              - $ref: '#/components/schemas/Lecturer'
 *              - $ref: '#/components/schemas/Candidate'
 *      CollegeStudent:
 *          type: object
 *          properties:
 *              graduated:
 *                  type: boolean
 *              classCode:
 *                  type: string
 *              faculty:
 *                  type: string
 *              major:
 *                  type: string
 *              enrollmentYear:
 *                  type: string
 *      Lecturer:
 *          type: object
 *          properties:
 *              faculty:
 *                  type: string
 *      Candidate:
 *          type: object
 *          properties:
 *              registeredMajor:
 *                  type: string
 *              highSchool:
 *                  type: string
 *      TokensResponse:
 *          type: object
 *          properties:
 *              accessToken:
 *                  type: string
 *              refreshToken:
 *                  type: string
 *      UpdatedByObject:
 *          type: object
 *          properties:
 *              username:
 *                  type: string
 *      MajorDataResponse:
 *          type: object
 *          properties:
 *              _id:
 *                  type: string
 *              name:
 *                  type: object
 *                  additionalProperties:
 *                      type: string
 *                  example:
 *                      vi: Công nghệ thông tin
 *                      en: Information Technology
 *              faculty:
 *                  type: object
 *                  properties:
 *                      _id:
 *                          type: string
 *                      code:
 *                          type: string
 *                      name:
 *                          type: string
 *              createdBy:
 *                  $ref: '#components/schemas/UpdatedByObject'
 *              updatedBy:
 *                  $ref: '#components/schemas/UpdatedByObject'
 *      FacultyDataResponse:
 *          type: object
 *          properties:
 *              _id:
 *                  type: string
 *              code:
 *                  type: string
 *              name:
 *                  type: string
 *              createdBy:
 *                  $ref: '#components/schemas/UpdatedByObject'
 *              updatedBy:
 *                  $ref: '#components/schemas/UpdatedByObject'
 *      AdminGroupDataResponse:
 *          type: object
 *          properties:
 *              _id:
 *                  type: string
 *              groupName:
 *                  type: string
 *              admins:
 *                  type: array
 *                  items:
 *                      type: string
 *              createdBy:
 *                  $ref: '#components/schemas/UpdatedByObject'
 *              updatedBy:
 *                  $ref: '#components/schemas/UpdatedByObject'
 *      ResourceDataResponse:
 *          type: object
 *          properties:
 *              _id:
 *                  type: string
 *              resourceName:
 *                  type: string
 *                  description: The endpoint want to restrict
 *              othersPermission:
 *                  type: string
 *                  description: Allowed operations for public using
 *              permission:
 *                  type: string
 *                  description: Reference to specific assigned in ResourcePermission. Details permission assigned to Admin/AdminGroup.
 *              createdBy:
 *                  $ref: '#components/schemas/UpdatedByObject'
 *              updatedBy:
 *                  $ref: '#components/schemas/UpdatedByObject'
 *      PermissionDataResponse:
 *          type: object
 *          properties:
 *              _id:
 *                  type: string
 *              resource:
 *                  type: object
 *                  properties:
 *                      _id:
 *                          type: string
 *                      resourceName:
 *                          type: string
 *                      othersPermission:
 *                          type: integer
 *              operation:
 *                  type: integer
 *      ResourcePermissionDataResponse:
 *          type: object
 *          properties:
 *              _id:
 *                  type: string
 *              resource:
 *                  type: object
 *                  properties:
 *                      _id:
 *                          type: string
 *                      resourceName:
 *                          type: string
 *                      othersPermission:
 *                          type: integer
 *              actor:
 *                  type: string
 *                  description: object Id refers to Admin if actorType is Admin. Otherwise the object id refers to a group if actorType is AdminGroup.
 *              actorType:
 *                  type: string
 *                  description: allowed operations can be assigned to Admin or AdminGroup [Admin, AdminGroup].
 *              operation:
 *                  type: integer
 *                  description: [0, 7]
 *              createdBy:
 *                  $ref: '#components/schemas/UpdatedByObject'
 *              updatedBy:
 *                  $ref: '#components/schemas/UpdatedByObject'
 *      AdminDataResponse:
 *          type: object
 *          properties:
 *              _id:
 *                  type: string
 *              email:
 *                  type: string
 *              avatar:
 *                  type: string
 *              type:
 *                  type: string
 *                  description: admin or sysAdmin
 *              group:
 *                  type: string
 *                  description: ID reference to Admin Group
 *              createdAt:
 *                  type: integer
 *              updatedAt:
 *                  type: integer
 *      UserDataResponse:
 *          type: object
 *          properties:
 *              _id:
 *                  type: string
 *              identityCode:
 *                  type: string
 *                  description: Mã định danh người dùng trong business, sinh viên tương ứng với MSV, giảng viên tương ứng với MGV
 *              firstName:
 *                  type: string
 *              lastName:
 *                  type: string
 *              email:
 *                  type: string
 *              username:
 *                  type: string
 *              hometown:
 *                  type: string
 *              birthdate:
 *                  type: string
 *                  description: dd/mm/yyyy
 *              avatar:
 *                  type: string
 *                  description: đường dẫn ảnh
 *              status:
 *                  type: integer
 *                  description: -1,0,1. -1 với tài khoản chưa xét duyệt, 0 với tài khoản bị khóa, 1 với tài khoản đang hoạt động
 *              friends:
 *                  type: array
 *                  items:
 *                    type: string
 *              friendCount:
 *                  type: integer
 *              details:
 *                  $ref: '#components/schemas/UserDetails'
 *              type:
 *                  $ref: '#components/schemas/UserType'
 *              createdAt:
 *                  type: integer
 *              updatedAt:
 *                  type: integer
 *      AdminLoginResponse:
 *          type: object
 *          properties:
 *              message:
 *                  type: string
 *                  description: Chứa thông báo lỗi, thông báo thành công
 *              status:
 *                 type: integer
 *                 description: status code
 *              data:
 *                 type: object
 *                 description: Dữ liệu khi lấy được từ backend, sẽ luôn được wrap trong object này
 *                 properties:
 *                  user:
 *                      $ref: '#components/schemas/AdminDataResponse'
 *                  tokens:
 *                      $ref: '#components/schemas/TokensResponse'
 *      RefreshTokenResponse:
 *          type: object
 *          properties:
 *              message:
 *                  type: string
 *                  description: Chứa thông báo lỗi, thông báo thành công
 *              status:
 *                 type: integer
 *                 description: status code
 *              data:
 *                  $ref: "#components/schemas/TokensResponse"
 *      LoginResponse:
 *          type: object
 *          properties:
 *              message:
 *                  type: string
 *                  description: Chứa thông báo lỗi, thông báo thành công
 *              status:
 *                 type: integer
 *                 description: status code
 *              data:
 *                 type: object
 *                 description: Dữ liệu khi lấy được từ backend, sẽ luôn được wrap trong object này
 *                 properties:
 *                  user:
 *                      $ref: '#components/schemas/UserDataResponse'
 *                  tokens:
 *                      $ref: '#components/schemas/TokensResponse'
 *      RegisterResponse:
 *          type: object
 *          properties:
 *              message:
 *                  type: string
 *              status:
 *                  type: integer
 *                  description: status code
 *              data:
 *                  $ref: '#components/schemas/UserDataResponse'
 *      ChangePasswordRequest:
 *          type: object
 *          properties:
 *              currentPassword:
 *                  type: string
 *              newPassword:
 *                  type: string
 */

/**
 *  @swagger
 *  tags:
 *      name: Auth
 *      description: The authentication API
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login for users
 *     tags: [Auth]
 *     descriptions: Endpoint for user login
 *     requestBody:
 *      required: true
 *      content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      email:
 *                          type: string
 *                      password:
 *                          type: string
 *     responses:
 *      200:
 *          description: Login successful
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#components/schemas/LoginResponse'
 *      400:
 *          description: Invalid input
 *      401:
 *          description: Invalid credentials
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *  post:
 *    summary: User register
 *    tags: [Auth]
 *    description: Endpoint for user register
 *    requestBody:
 *      required: true
 *      content:
 *          application/json:
 *              schema:
 *                  $ref: '#components/schemas/RegisterRequest'
 *    responses:
 *      201:
 *          description: Registered successfully
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#components/schemas/RegisterResponse'
 *
 *      400:
 *          description: Invalid User Type .., Invalid input
 *      409:
 *          description: Email conflicts
 *      500:
 *          description: Internal error. Maybe unexpected error
 */

/**
 * @swagger
 * /api/v1/auth/refresh-token:
 *  post:
 *    summary: User refresh token
 *    tags: [Auth]
 *    description: Endpoint for user refresh token
 *    requestBody:
 *      required: true
 *      content:
 *          application/json:
 *              schema:
 *                  $ref: '#components/schemas/RefreshTokenRequest'
 *    responses:
 *      200:
 *          description: Success
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#components/schemas/RefreshTokenResponse'
 *      401:
 *          description: Invalid token
 *      403:
 *          description: Forbidden Error
 *      400:
 *          description: Invalid input
 *      500:
 *          description: Internal error. Maybe unexpected error
 */


/**
 *  @swagger
 *  tags:
 *      name: AdminAuth
 *      description: The authentication API
 */

/**
 * @swagger
 * /api/v1/aauth/login:
 *  post:
 *    summary: Admin login
 *    tags: [AdminAuth]
 *    description: Endpoint for admin login
 *    requestBody:
 *      required: true
 *      content:
 *          application/json:
 *              schema:
 *                  $ref: '#components/schemas/LoginRequest'
 *    responses:
 *      200:
 *          description: Login successfully
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#components/schemas/AdminLoginResponse'
 *
 *      401:
 *          description: Invalid credentials
 *      400:
 *          description: Invalid input
 *      500:
 *          description: Internal error. Maybe unexpected error
 */


/**
 * @swagger
 * /api/v1/aauth/refresh-token:
 *  post:
 *    summary: Admin refresh token
 *    tags: [AdminAuth]
 *    description: Endpoint for admin refresh token
 *    requestBody:
 *      required: true
 *      content:
 *          application/json:
 *              schema:
 *                  $ref: '#components/schemas/RefreshTokenRequest'
 *    responses:
 *      200:
 *          description: Success
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#components/schemas/RefreshTokenResponse'
 *      401:
 *          description: Invalid token
 *      403:
 *          description: Forbidden error
 *      400:
 *          description: Invalid input
 *      500:
 *          description: Internal error. Maybe unexpected error
 */


/**
 * @swagger
 * /api/v1/aauth/{adminId}/change-password:
 *  put:
 *    summary: Change password admin
 *    tags: [AdminAuth]
 *    description: ''
 *    parameters:
 *      - name: adminId
 *        in: path
 *        description: ID of admin to update
 *        required: true
 *        schema:
 *          type: string
 *    requestBody:
 *      required: true
 *      content:
 *          application/json:
 *              schema:
 *                  $ref: '#components/schemas/ChangePasswordRequest'
 *    responses:
 *      200:
 *          description: Change password success
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *                          status:
 *                              type: integer
 *                          data:
 *                              type: object
 *      400:
 *          description: Invalid input
 *      401:
 *          description: Invalid credentials
 *      403:
 *          description: Forbidden error
 *      500:
 *          description: Internal error. Maybe unexpected error
 *    security:
 *      - bearerAuth: []
 */

/**
 * @swagger
 * /api/v1/aauth/{adminId}/change-username:
 *  put:
 *    summary: Change username admin
 *    tags: [AdminAuth]
 *    description: ''
 *    parameters:
 *      - name: adminId
 *        in: path
 *        description: ID of admin to update
 *        required: true
 *        schema:
 *          type: string
 *    requestBody:
 *      required: true
 *      content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      username:
 *                          type: string
 *    responses:
 *      200:
 *          description: Change username success
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *                          status:
 *                              type: integer
 *                          data:
 *                              $ref: '#components/schemas/AdminDataResponse'
 *      400:
 *          description: Invalid input
 *      401:
 *          description: Invalid credentials
 *      403:
 *          description: Forbidden error
 *      409:
 *          description: Validation error
 *      500:
 *          description: Internal error. Maybe unexpected error
 *    security:
 *      - bearerAuth: []
 */


/**
 *  @swagger
 *  tags:
 *      name: Admin
 *      description: The Admin Management API
 */


/**
 * @swagger
 * /api/v1/aauth/admin:
 *  get:
 *    summary: Get list admin
 *    tags: [Admin]
 *    description: ''
 *    parameters:
 *     - name: page
 *       in: query
 *       description: The number of items to skip before starting to collect the result set
 *       required: false
 *       schema:
 *          type: integer
 *          minimum: 1
 *     - name: limit
 *       in: query
 *       description: The number of items to return.
 *       required: false
 *       schema:
 *          type: integer
 *          minimum: 1
 *     - name: search
 *       in: query
 *       description: The keyword used to search
 *       required: false
 *       schema:
 *          type: string
 *    responses:
 *      200:
 *          description: Successful operation
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *                          status:
 *                              type: integer
 *                          data:
 *                              type: object
 *                              properties:
 *                                  admins:
 *                                      type: array
 *                                      items:
 *                                          $ref: '#components/schemas/AdminDataResponse'
 *                                  totalCount:
 *                                      type: integer
 *      400:
 *          description: Invalid input
 *      401:
 *          description: Invalid credentials
 *      403:
 *          description: Forbidden error
 *      500:
 *          description: Internal error. Maybe unexpected error
 *    security:
 *      - bearerAuth: []
 */

/**
 * @swagger
 * /api/v1/aauth/admin:
 *  post:
 *    summary: Create Admin
 *    tags: [Admin]
 *    description: Create new admin
 *    requestBody:
 *      required: true
 *      content:
 *          application/json:
 *              schema:
 *                  $ref: '#components/schemas/LoginRequest'
 *    responses:
 *      201:
 *          description: Created successfully
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *                          status:
 *                              type: integer
 *                          data:
 *                              $ref: '#components/schemas/AdminDataResponse'
 *      400:
 *          description: Invalid input
 *      401:
 *          description: Invalid credentials
 *      403:
 *          description: Forbidden error

 *      409:
 *          description: Validation error
 *      500:
 *          description: Internal error. Maybe unexpected error
 *    security:
 *      - bearerAuth: []
 */

/**
 * @swagger
 * /api/v1/aauth/admin/{adminId}:
 *  delete:
 *    summary: Delete admin
 *    tags: [Admin]
 *    description: ''
 *    parameters:
 *      - name: adminId
 *        in: path
 *        description: ID of admin to update
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *          description: Delete success
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *                          status:
 *                              type: integer
 *                          data:
 *                              type: object
 *      400:
 *          description: Invalid input
 *      401:
 *          description: Invalid credentials
 *      403:
 *          description: Forbidden error
 *      404:
 *          description: Resource not found
 *      409:
 *          description: Validation error
 *      500:
 *          description: Internal error. Maybe unexpected error
 *    security:
 *      - bearerAuth: []
 */


/**
 *  @swagger
 *  tags:
 *      name: Admin Group
 *      description: The Admin Group Management API
 */

/**
 * @swagger
 * /api/v1/aauth/admin-groups:
 *  get:
 *    summary: Get admin groups
 *    tags: [Admin Group]
 *    description: ''
 *    parameters:
 *     - name: page
 *       in: query
 *       description: The number of items to skip before starting to collect the result set
 *       required: false
 *       schema:
 *          type: integer
 *          minimum: 1
 *     - name: limit
 *       in: query
 *       description: The number of items to return.
 *       required: false
 *       schema:
 *          type: integer
 *          minimum: 1
 *     - name: search
 *       in: query
 *       description: The keyword used to search
 *       required: false
 *       schema:
 *          type: string
 *    responses:
 *      200:
 *          description: Successful operation
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *                          status:
 *                              type: integer
 *                          data:
 *                              type: object
 *                              properties:
 *                                  groups:
 *                                      type: array
 *                                      items:
 *                                          $ref: '#components/schemas/AdminGroupDataResponse'
 *                                  totalCount:
 *                                      type: integer
 *      400:
 *          description: Invalid input
 *      401:
 *          description: Invalid credentials
 *      403:
 *          description: Forbidden error
 *      500:
 *          description: Internal error. Maybe unexpected error
 *    security:
 *      - bearerAuth: []
 */

/**
 * @swagger
 * /api/v1/aauth/admin-groups:
 *  post:
 *    summary: Create admin group
 *    tags: [Admin Group]
 *    description: ''
 *    requestBody:
 *      required: true
 *      content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      groupName:
 *                          type: string
 *    responses:
 *      201:
 *          description: Successful operation
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *                          status:
 *                              type: integer
 *                          data:
 *                              $ref: '#components/schemas/AdminGroupDataResponse'
 *      400:
 *          description: Invalid input
 *      401:
 *          description: Invalid credentials
 *      403:
 *          description: Forbidden error
 *      409:
 *          description: Validation error
 *      500:
 *          description: Internal error. Maybe unexpected error
 *    security:
 *      - bearerAuth: []
 */


/**
 * @swagger
 * /api/v1/aauth/admin-groups/{groupId}:
 *  put:
 *    summary: Change group name
 *    tags: [Admin Group]
 *    description: ''
 *    parameters:
 *      - name: groupId
 *        in: path
 *        description: ID of group to update
 *        required: true
 *        schema:
 *          type: string
 *    requestBody:
 *      required: true
 *      content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      groupName:
 *                          type: string
 *    responses:
 *      200:
 *          description: Successful operation
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *                          status:
 *                              type: integer
 *                          data:
 *                              $ref: '#components/schemas/AdminGroupDataResponse'
 *      400:
 *          description: Invalid input
 *      401:
 *          description: Invalid credentials
 *      403:
 *          description: Forbidden error
 *      404:
 *          description: Resource not found
 *      409:
 *          description: Validation error
 *      500:
 *          description: Internal error. Maybe unexpected error
 *    security:
 *      - bearerAuth: []
 */


/**
 * @swagger
 * /api/v1/aauth/admin-groups/{groupId}:
 *  delete:
 *    summary: Delete Admin Group
 *    tags: [Admin Group]
 *    description: ''
 *    parameters:
 *      - name: groupId
 *        in: path
 *        description: ID of group to delete
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *          description: Delete success
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *                          status:
 *                              type: integer
 *                          data:
 *                              type: object
 *      400:
 *          description: Invalid input
 *      401:
 *          description: Invalid credentials
 *      403:
 *          description: Forbidden error
 *      404:
 *          description: Resource not found
 *      500:
 *          description: Internal error. Maybe unexpected error
 *    security:
 *      - bearerAuth: []
 */



/**
 * @swagger
 * /api/v1/aauth/admin-groups/{groupId}/admins:
 *  post:
 *    summary: Add admin to group
 *    tags: [Admin Group]
 *    description: ''
 *    parameters:
 *      - name: groupId
 *        in: path
 *        description: ID of group to update
 *        required: true
 *        schema:
 *          type: string
 *    requestBody:
 *      required: true
 *      content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      adminId:
 *                          type: string
 *    responses:
 *      200:
 *          description: Successful operation
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *                          status:
 *                              type: integer
 *                          data:
 *                              $ref: '#components/schemas/AdminDataResponse'
 *      400:
 *          description: Invalid input
 *      401:
 *          description: Invalid credentials
 *      403:
 *          description: Forbidden error
 *      409:
 *          description: Validation error
 *      500:
 *          description: Internal error. Maybe unexpected error
 *    security:
 *      - bearerAuth: []
 */



/**
 * @swagger
 * /api/v1/aauth/admin-groups/{groupId}/admins:
 *  delete:
 *    summary: Remove admin from specific group
 *    tags: [Admin Group]
 *    description: ''
 *    parameters:
 *      - name: groupId
 *        in: path
 *        description: ID of group to update
 *        required: true
 *        schema:
 *          type: string
 *    requestBody:
 *      required: true
 *      content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      adminId:
 *                          type: string
 *    responses:
 *      200:
 *          description: Successful operation
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *                          status:
 *                              type: integer
 *                          data:
 *                              $ref: '#components/schemas/AdminDataResponse'
 *      400:
 *          description: Invalid input
 *      401:
 *          description: Invalid credentials
 *      403:
 *          description: Forbidden error
 *      409:
 *          description: Validation error
 *      500:
 *          description: Internal error. Maybe unexpected error
 *    security:
 *      - bearerAuth: []
 */


/**
 *  @swagger
 *  tags:
 *      name: Permission
 *      description: The Permission Management API
 */

/**
 * @swagger
 * /api/v1/permission:
 *  get:
 *    summary: Get current list permission
 *    tags: [Permission]
 *    description: ''
 *    parameters:
 *     - name: page
 *       in: query
 *       description: The number of items to skip before starting to collect the result set
 *       required: false
 *       schema:
 *          type: integer
 *          minimum: 1
 *     - name: limit
 *       in: query
 *       description: The number of items to return.
 *       required: false
 *       schema:
 *          type: integer
 *          minimum: 1
 *    responses:
 *      200:
 *          description: Successful operation
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *                          status:
 *                              type: integer
 *                          data:
 *                              type: object
 *                              properties:
 *                                  permissions:
 *                                      type: array
 *                                      items:
 *                                          $ref: '#components/schemas/PermissionDataResponse'
 *                                  totalCount:
 *                                      type: integer
 *      400:
 *          description: Invalid input
 *      401:
 *          description: Invalid credentials
 *      403:
 *          description: Forbidden error
 *      500:
 *          description: Internal error. Maybe unexpected error
 *    security:
 *      - bearerAuth: []
 */


/**
 * @swagger
 * /api/v1/permission/resource:
 *  get:
 *    summary: Get list restricted resources
 *    tags: [Permission]
 *    description: 'Get the list of restricted endpoints that required permissions to access and execute. Ex: "/aauth/admin".'
 *    parameters:
 *     - name: page
 *       in: query
 *       description: The number of items to skip before starting to collect the result set
 *       required: false
 *       schema:
 *          type: integer
 *          minimum: 1
 *     - name: limit
 *       in: query
 *       description: The number of items to return.
 *       required: false
 *       schema:
 *          type: integer
 *          minimum: 1
 *     - name: search
 *       in: query
 *       description: The keyword used to search
 *       required: false
 *       schema:
 *          type: string
 *    responses:
 *      200:
 *          description: Successful operation
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *                          status:
 *                              type: integer
 *                          data:
 *                              type: object
 *                              properties:
 *                                  resources:
 *                                      type: array
 *                                      items:
 *                                          $ref: '#components/schemas/ResourceDataResponse'
 *                                  totalCount:
 *                                      type: integer
 *      400:
 *          description: Invalid input
 *      401:
 *          description: Invalid credentials
 *      403:
 *          description: Forbidden error
 *      500:
 *          description: Internal error. Maybe unexpected error
 *    security:
 *      - bearerAuth: []
 */


/**
 * @swagger
 * /api/v1/permission/resource:
 *  post:
 *    summary: Create new resource
 *    tags: [Permission]
 *    description: ''
 *    requestBody:
 *      required: true
 *      content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      resourceName:
 *                          type: string
 *                      othersPermission:
 *                          type: integer
 *    responses:
 *      200:
 *          description: Successful operation
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *                          status:
 *                              type: integer
 *                          data:
 *                              $ref: '#components/schemas/ResourceDataResponse'
 *      400:
 *          description: Invalid input
 *      401:
 *          description: Invalid credentials
 *      403:
 *          description: Forbidden error
 *      409:
 *          description: Validation error
 *      500:
 *          description: Internal error. Maybe unexpected error
 *    security:
 *      - bearerAuth: []
 */


/**
 * @swagger
 * /api/v1/permission/resource/{resourceId}:
 *  put:
 *    summary: Update restricted resource
 *    tags: [Permission]
 *    description: 'Update restricted resource'
 *    parameters:
 *      - name: resourceId
 *        in: path
 *        description: ID of resource to update
 *        required: true
 *        schema:
 *          type: string
 *    requestBody:
 *      required: true
 *      content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      resourceName:
 *                          type: string
 *                      othersPermission:
 *                          type: string
 *    responses:
 *      200:
 *          description: Successful operation
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *                          status:
 *                              type: integer
 *                          data:
 *                              $ref: '#components/schemas/ResourceDataResponse'
 *      400:
 *          description: Invalid input
 *      401:
 *          description: Invalid credentials
 *      403:
 *          description: Forbidden error
 *      404:
 *          description: Resource not found
 *      409:
 *          description: Validation error
 *      500:
 *          description: Internal error. Maybe unexpected error
 *    security:
 *      - bearerAuth: []
 */

/**
 * @swagger
 * /api/v1/permission/resource/{resourceId}:
 *  delete:
 *    summary: Remove restricted resource
 *    tags: [Permission]
 *    description: ''
 *    parameters:
 *      - name: resourceId
 *        in: path
 *        description: ID of resource to delete
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *          description: Successful operation
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *                          status:
 *                              type: integer
 *                          data:
 *                              type: object
 *      400:
 *          description: Invalid input
 *      401:
 *          description: Invalid credentials
 *      403:
 *          description: Forbidden error
 *      409:
 *          description: Validation error
 *      500:
 *          description: Internal error. Maybe unexpected error
 *    security:
 *      - bearerAuth: []
 */

/**
 * @swagger
 * /api/v1/permission/resource-permission:
 *  get:
 *    summary: Get list resource permission
 *    tags: [Permission]
 *    description: 'Get the list allowed permissions assigned to specific Admin/AdminGroup'
 *    parameters:
 *     - name: page
 *       in: query
 *       description: The number of items to skip before starting to collect the result set
 *       required: false
 *       schema:
 *          type: integer
 *          minimum: 1
 *     - name: limit
 *       in: query
 *       description: The number of items to return.
 *       required: false
 *       schema:
 *          type: integer
 *          minimum: 1
 *     - name: search
 *       in: query
 *       description: The keyword used to search
 *       required: false
 *       schema:
 *          type: string
 *     - name: actorTypeFilter
 *       in: query
 *       description: The filter to get only permissions applied to Admin/Admin Group
 *       required: false
 *       schema:
 *          type: string
 *    responses:
 *      200:
 *          description: Successful operation
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *                          status:
 *                              type: integer
 *                          data:
 *                              type: object
 *                              properties:
 *                                  resourcePermissions:
 *                                      type: array
 *                                      items:
 *                                          $ref: '#components/schemas/ResourcePermissionDataResponse'
 *                                  totalCount:
 *                                      type: integer
 *      400:
 *          description: Invalid input
 *      401:
 *          description: Invalid credentials
 *      403:
 *          description: Forbidden error
 *      500:
 *          description: Internal error. Maybe unexpected error
 *    security:
 *      - bearerAuth: []
 */

/**
 * @swagger
 * /api/v1/permission/resource-permission:
 *  post:
 *    summary: Create new resource permission
 *    tags: [Permission]
 *    description: 'Assign new allowed operations in restricted specific resource to Admin/Admin Group.'
 *    requestBody:
 *      required: true
 *      content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      resource:
 *                          type: string
 *                          description: ID reference to resource
 *                      actor:
 *                          type: string
 *                          description: ID reference to Admin/AdminGroup
 *                      actorType:
 *                          type: string
 *                          description: Valid values [Admin, AdminGroup]
 *                      operation:
 *                          type: integer
 *                          description: Allowed operations. Valid value [0, 7]
 *    responses:
 *      200:
 *          description: Successful operation
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *                          status:
 *                              type: integer
 *                          data:
 *                              $ref: '#components/schemas/ResourcePermissionDataResponse'
 *      400:
 *          description: Invalid input
 *      401:
 *          description: Invalid credentials
 *      403:
 *          description: Forbidden error
 *      409:
 *          description: Validation error
 *      500:
 *          description: Internal error. Maybe unexpected error
 *    security:
 *      - bearerAuth: []
 */

/**
 * @swagger
 * /api/v1/permission/resource-permission/{resourcePermissionId}:
 *  put:
 *    summary: Update allowed operations in resource
 *    tags: [Permission]
 *    description: ''
 *    parameters:
 *      - name: resourcePermissionId
 *        in: path
 *        description: ID of resource permission to update
 *        required: true
 *        schema:
 *          type: string
 *    requestBody:
 *      required: true
 *      content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      operation:
 *                          type: integer
 *    responses:
 *      200:
 *          description: Successful operation
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *                          status:
 *                              type: integer
 *                          data:
 *                              $ref: '#components/schemas/ResourcePermissionDataResponse'
 *      400:
 *          description: Invalid input
 *      401:
 *          description: Invalid credentials
 *      403:
 *          description: Forbidden error
 *      404:
 *          description: Resource not found
 *      409:
 *          description: Validation error
 *      500:
 *          description: Internal error. Maybe unexpected error
 *    security:
 *      - bearerAuth: []
 */

/**
 * @swagger
 * /api/v1/permission/resource-permission/{resourcePermissionId}:
 *  delete:
 *    summary: Remove resource permission
 *    tags: [Permission]
 *    description: ''
 *    parameters:
 *      - name: resourcePermissionId
 *        in: path
 *        description: ID of resource permission to delete
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *          description: Successful operation
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *                          status:
 *                              type: integer
 *                          data:
 *                              type: object
 *      400:
 *          description: Invalid input
 *      401:
 *          description: Invalid credentials
 *      403:
 *          description: Forbidden error
 *      409:
 *          description: Validation error
 *      500:
 *          description: Internal error. Maybe unexpected error
 *    security:
 *      - bearerAuth: []
 */

/**
 *  @swagger
 *  tags:
 *      name: Faculty
 *      description: The Faculty Management API
 */

/**
 * @swagger
 * /api/v1/faculty:
 *  get:
 *    summary: Get list faculties
 *    tags: [Faculty]
 *    description: ''
 *    parameters:
 *     - name: page
 *       in: query
 *       description: The number of items to skip before starting to collect the result set
 *       required: false
 *       schema:
 *          type: integer
 *          minimum: 1
 *     - name: limit
 *       in: query
 *       description: The number of items to return.
 *       required: false
 *       schema:
 *          type: integer
 *          minimum: 1
 *     - name: search
 *       in: query
 *       description: The keyword used to search
 *       required: false
 *       schema:
 *          type: string
 *    responses:
 *      200:
 *          description: Successful operation
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *                          status:
 *                              type: integer
 *                          data:
 *                              type: object
 *                              properties:
 *                                  faculties:
 *                                      type: array
 *                                      items:
 *                                          $ref: '#components/schemas/FacultyDataResponse'
 *                                  totalCount:
 *                                      type: integer
 *      400:
 *          description: Invalid input
 *      500:
 *          description: Internal error. Maybe unexpected error
 *    security:
 *      - bearerAuth: []
 */

/**
 * @swagger
 * /api/v1/faculty:
 *  post:
 *    summary: Create new faculty
 *    tags: [Faculty]
 *    description: ''
 *    requestBody:
 *      required: true
 *      content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      code:
 *                          type: string
 *                      name:
 *                          type: string
 *    responses:
 *      201:
 *          description: Successful operation
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *                          status:
 *                              type: integer
 *                          data:
 *                              $ref: '#components/schemas/FacultyDataResponse'
 *      400:
 *          description: Invalid input
 *      401:
 *          description: Invalid credentials
 *      403:
 *          description: Forbidden error
 *      409:
 *          description: Validation error
 *      500:
 *          description: Internal error. Maybe unexpected error
 *    security:
 *      - bearerAuth: []
 */

/**
 * @swagger
 * /api/v1/faculty/{facultyId}:
 *  put:
 *    summary: Update faculty
 *    tags: [Faculty]
 *    description: ''
 *    parameters:
 *      - name: facultyId
 *        in: path
 *        description: ID of faculty to update
 *        required: true
 *        schema:
 *          type: string
 *    requestBody:
 *      required: true
 *      content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      code:
 *                          type: string
 *                      name:
 *                          type: string
 *    responses:
 *      200:
 *          description: Successful operation
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *                          status:
 *                              type: integer
 *                          data:
 *                              $ref: '#components/schemas/FacultyDataResponse'
 *      400:
 *          description: Invalid input
 *      401:
 *          description: Invalid credentials
 *      403:
 *          description: Forbidden error
 *      404:
 *          description: Resource not found
 *      409:
 *          description: Validation error
 *      500:
 *          description: Internal error. Maybe unexpected error
 *    security:
 *      - bearerAuth: []
 */

/**
 * @swagger
 * /api/v1/faculty/{facultyId}:
 *  delete:
 *    summary: Remove faculty
 *    tags: [Faculty]
 *    description: ''
 *    parameters:
 *      - name: facultyId
 *        in: path
 *        description: ID of faculty to delete
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *          description: Successful operation
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *                          status:
 *                              type: integer
 *                          data:
 *                              type: object
 *      400:
 *          description: Invalid input
 *      401:
 *          description: Invalid credentials
 *      403:
 *          description: Forbidden error
 *      409:
 *          description: Validation error
 *      500:
 *          description: Internal error. Maybe unexpected error
 *    security:
 *      - bearerAuth: []
 */

/**
 *  @swagger
 *  tags:
 *      name: Major
 *      description: The Major Management API
 */

/**
 * @swagger
 * /api/v1/major:
 *  get:
 *    summary: Get list majors
 *    tags: [Major]
 *    description: ''
 *    parameters:
 *     - name: page
 *       in: query
 *       description: The number of items to skip before starting to collect the result set
 *       required: false
 *       schema:
 *          type: integer
 *          minimum: 1
 *     - name: limit
 *       in: query
 *       description: The number of items to return.
 *       required: false
 *       schema:
 *          type: integer
 *          minimum: 1
 *     - name: search
 *       in: query
 *       description: The keyword used to search
 *       required: false
 *       schema:
 *          type: string
 *     - name: lang
 *       in: query
 *       description: The language used to filter
 *       required: false
 *       schema:
 *          type: string
 *    responses:
 *      200:
 *          description: Successful operation
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *                          status:
 *                              type: integer
 *                          data:
 *                              type: object
 *                              properties:
 *                                  majors:
 *                                      type: array
 *                                      items:
 *                                          $ref: '#components/schemas/MajorDataResponse'
 *                                  totalCount:
 *                                      type: integer
 *      400:
 *          description: Invalid input
 *      500:
 *          description: Internal error. Maybe unexpected error
 *    security:
 *      - bearerAuth: []
 */

/**
 * @swagger
 * /api/v1/major:
 *  post:
 *    summary: Create new major
 *    tags: [Major]
 *    description: ''
 *    requestBody:
 *      required: true
 *      content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      code:
 *                          type: string
 *                      name:
 *                          type: object
 *                          additionalProperties:
 *                              type: string
 *                          example:
 *                              vi: Công nghệ thông tin
 *                              en: Information technology
 *                      facultyId:
 *                          type: string
 *    responses:
 *      201:
 *          description: Successful operation
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *                          status:
 *                              type: integer
 *                          data:
 *                              $ref: '#components/schemas/MajorDataResponse'
 *      400:
 *          description: Invalid input
 *      401:
 *          description: Invalid credentials
 *      403:
 *          description: Forbidden error
 *      409:
 *          description: Validation error
 *      500:
 *          description: Internal error. Maybe unexpected error
 *    security:
 *      - bearerAuth: []
 */

/**
 * @swagger
 * /api/v1/major/{majorId}:
 *  put:
 *    summary: Update major
 *    tags: [Major]
 *    description: ''
 *    parameters:
 *      - name: majorId
 *        in: path
 *        description: ID of major to update
 *        required: true
 *        schema:
 *          type: string
 *    requestBody:
 *      required: true
 *      content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      code:
 *                          type: string
 *                      name:
 *                          type: object
 *                          additionalProperties:
 *                              type: string
 *                          example:
 *                              vi: Công nghệ thông tin
 *                              en: Information technology
 *    responses:
 *      200:
 *          description: Successful operation
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *                          status:
 *                              type: integer
 *                          data:
 *                              $ref: '#components/schemas/FacultyDataResponse'
 *      400:
 *          description: Invalid input
 *      401:
 *          description: Invalid credentials
 *      403:
 *          description: Forbidden error
 *      404:
 *          description: Resource not found
 *      409:
 *          description: Validation error
 *      500:
 *          description: Internal error. Maybe unexpected error
 *    security:
 *      - bearerAuth: []
 */


/**
 * @swagger
 * /api/v1/major/{majorId}:
 *  delete:
 *    summary: Remove major
 *    tags: [Major]
 *    description: ''
 *    parameters:
 *      - name: majorId
 *        in: path
 *        description: ID of major to delete
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *          description: Successful operation
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *                          status:
 *                              type: integer
 *                          data:
 *                              type: object
 *      400:
 *          description: Invalid input
 *      401:
 *          description: Invalid credentials
 *      403:
 *          description: Forbidden error
 *      409:
 *          description: Validation error
 *      500:
 *          description: Internal error. Maybe unexpected error
 *    security:
 *      - bearerAuth: []
 */


