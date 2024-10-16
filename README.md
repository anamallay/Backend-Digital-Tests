# Digital Tests (Backend)

The backend for **Digital Tests**, a web application for creating, sharing, and taking tests. This server provides APIs for user authentication, quiz management, and results storage. It's built using Node.js, Express, and MongoDB.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Localization ](#localization)
- [Technologies Used](#technologies-used)
- [License](#license)

## Features

- **User Authentication**: Register, login, password reset, and account management.
- **Quiz Management**: Add, update, and delete quizzes with questions and multiple answer options.
- **Quiz Types**: Create public or private quizzes.
- **Result Tracking**: Store quiz results, display correct answers, and calculate scores.
- **Internationalization**: Supports English and Arabic languages.
- **Email Notifications**: Sends account activation, password reset, and account deletion emails.

## Getting Started

To get started with the **Digital Tests** backend, follow these steps to set up the project locally.

### Prerequisites

Ensure that you have the following installed:

- [Node.js](https://nodejs.org/) v14 or higher.
- [MongoDB](https://www.mongodb.com/): Ensure MongoDB is running locally or provide a connection string for a cloud instance.

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/anamallay/Backend-Digital-Tests
   ```

2. **Navigate into the project directory**:

   ```bash
   cd Backend-Digital-Tests
   ```

3. **Install Dependencies**:

   ```bash
   npm install
   ```

   This will install all necessary packages listed in `package.json`

4. **Set Up Environment Variables**:

   Create a `.env` file in the root of the project directory and add the required environment variables as specified in the [Environment Variables](#environment-variables) section.

5. **Run the Application**:
   ```bash
   npm run start
   ```

## API Documentation

### Base URL

All endpoints use the base URL: `/api/`

### Authentication

The authentication system provides routes for user login, logout, password reset, and user session management. All authentication-related requests must handle JWT tokens stored in cookies. The following endpoints are available:

- **POST** `/auths/login`: Log in a user.

  - Middleware: `clearPreviousLoginCookie`, `isLoggedOut`
  - Request Body: `email`, `password`
  - Response: Access token and user details.
  - The `clearPreviousLoginCookie` middleware ensures that any existing login cookies are cleared before the new login attempt.

- **POST** `/auths/logout`: Log out a user.

  - Middleware: `isLoggedIn`
  - Response: Logout confirmation.
  - This route invalidates the user's session by clearing the access token stored in the cookies.

- **POST** `/auths/forget-password`: Send password reset email.

  - Request Body: `email`
  - Response: Email sent status.
  - This route allows users to request a password reset by sending an email with the reset instructions.

- **PUT** `/auths/reset-password`: Reset user password.
  - Request Body: `token`, `newPassword`, `confirmPassword`
  - Response: Password reset confirmation.
  - Users can reset their passwords by providing a valid reset token, which is generated during the password reset request.

### User Management

- **POST** `/users/register`: Register a new user.

  - Middleware: `clearPreviousLoginCookie`, `isLoggedOut`, `registerValidation`, `runValidation`
  - Request Body: `name`, `username`, `email`, `password`, `confirmPassword`
  - Response: User details and activation link.
  - The email will include an activation link to verify the user's email address.

- **GET** `/users/activate`: Activate user account via activation link.

  - Query Params: `token`
  - Response: Account activation status.
  - This route verifies the activation token and activates the user’s account. If the account is already active, it returns a message indicating so.

- **POST** `/users/resend-activation-email`: Resend the activation email.

  - Request Body: `email`
  - Response: Email sent status.
  - This route allows a user to request a new activation email if they didn’t receive or lost the original one.

- **GET** `/users/user`: Get details of the currently logged-in user.

  - Middleware: `isLoggedIn`, `userId`
  - Response: User details.
  - This route retrieves the logged-in user's details based on the JWT token.

- **PUT** `/users/update-user`: Update user details.

  - Middleware: `isLoggedIn`, `userId`
  - Request Body: `name`, `username`, `email`
  - Response: Updated user information.
  - This route allows the user to update their profile information. If the email is updated, the account will be deactivated until reactivated through an email verification.

- **DELETE** `/users/delete-account`: Delete the logged-in user's account.
  - Middleware: `isLoggedIn`, `userId`
  - Response: Account deletion confirmation.
  - This route deletes the user’s account along with any quizzes, questions, and scores associated with that user. An email is sent to the user confirming the account deletion.

### Quiz Management

- **POST** `/quizzes/create`: Create a new quiz.

  - Middleware: `isLoggedIn`, `userId`
  - Request Body: `title`, `description`, `time`, `visibility`
  - Response: Quiz created.
  - This route allows users to create a quiz. The visibility can be either `public` or `private`, and time is required to indicate the duration of the quiz.

- **GET** `/quizzes/public`: Get all public quizzes.

  - Response: List of public quizzes.
  - This route retrieves all quizzes that are set as public. Pagination can be applied using the `page` and `limit` query parameters.

- **GET** `/quizzes/userQuiz`: Get all quizzes created by the logged-in user.

  - Middleware: `isLoggedIn`, `userId`
  - Response: List of quizzes created by the user.
  - This route retrieves quizzes that the logged-in user has created.

- **GET** `/quizzes/:id`: Get details of a specific quiz by ID.

  - Middleware: `isLoggedIn`, `userId`
  - Params: `id`
  - Response: Quiz details.
  - This route retrieves detailed information about a specific quiz. If the quiz is private, only the owner can access it.

- **PUT** `/quizzes/:id`: Update a quiz by ID.

  - Middleware: `isLoggedIn`, `userId`
  - Params: `id`
  - Request Body: Updated quiz details.
  - Response: Quiz updated.
  - This route allows the user to update the quiz information, such as title, description, time, visibility, and questions.

- **DELETE** `/quizzes/:id`: Delete a quiz by ID.

  - Middleware: `isLoggedIn`, `userId`
  - Params: `id`
  - Response: Quiz deleted.
  - This route allows the quiz owner to delete a quiz along with its associated questions and scores.

- **POST** `/quizzes/add-to-library`: Add a quiz to the user's library using a token.

  - Middleware: `isLoggedIn`, `userId`
  - Request Body: `token`
  - Response: Quiz added to library.
  - This route allows users to add a quiz to their personal library using a token shared with them.

- **POST** `/quizzes/library/add-public-quiz`: Add a public quiz to the user's library.

  - Middleware: `isLoggedIn`, `userId`
  - Request Body: `quizId`
  - Response: Quiz added to library.
  - This route allows users to add public quizzes to their library.

- **GET** `/quizzes/library`: Get the user's library of quizzes.

  - Middleware: `isLoggedIn`, `userId`
  - Response: List of quizzes in the user's library.
  - This route retrieves quizzes that have been added to the user's library.

- **DELETE** `/quizzes/library/:quizId`: Remove a quiz from the user's library.

  - Middleware: `isLoggedIn`, `userId`
  - Params: `quizId`
  - Response: Quiz removed from library.
  - This route allows users to remove a quiz from their library.

- **POST** `/quizzes/share-quiz`: Share a quiz with another user.

  - Middleware: `isLoggedIn`
  - Request Body: `quizId`, `email`
  - Response: Quiz shared.
  - This route generates a shareable link to allow another user to add the quiz to their library.

### Question Management

- **POST** `/questions/add`: Add a question to a quiz.

  - Middleware: `isLoggedIn`, `userId`
  - Request Body: `quizId`, `question`, `options`, `correctOption`
  - Response: Question added to quiz.
  - This route allows the user to add a new question to an existing quiz. The request must include the quiz ID, the question text, available options, and the correct option.

- **DELETE** `/questions/:quizId/:questionId`: Delete a question from a quiz.

  - Middleware: `isLoggedIn`, `userId`
  - Params: `quizId`, `questionId`
  - Response: Question deleted.
  - This route allows the user to delete a specific question from a quiz using the quiz ID and the question ID.

- **PUT** `/questions/:questionId`: Update a question in a quiz.

  - Middleware: `isLoggedIn`, `userId`
  - Params: `questionId`
  - Request Body: Updated question details such as `question`, `options`, `correctOption`
  - Response: Question updated.
  - This route allows the user to update the details of a question, including the question text, options, and correct answer.

- **GET** `/questions/quiz/:quizId`: Get all questions for a specific quiz.

  - Middleware: `isLoggedIn`, `userId`
  - Params: `quizId`
  - Response: List of questions for the quiz.
  - This route returns all questions associated with a specific quiz.

- **GET** `/questions/question/:questionId`: Get a specific question by ID.

  - Middleware: `isLoggedIn`, `userId`
  - Params: `questionId`
  - Response: Question details.
  - This route retrieves the details of a specific question by its ID.

### Score Management

- **GET** `/scores/examiner`: Get all quiz scores for the logged-in user (examiner).

  - Middleware: `isLoggedIn`
  - Response: List of quiz scores.
  - This route retrieves all scores for quizzes created by the logged-in user.

- **GET** `/scores`: Get all scores for the logged-in user.

  - Middleware: `isLoggedIn`, `userId`
  - Response: List of scores.
  - This route retrieves all quiz scores associated with the logged-in user.

- **GET** `/scores/:scoreId`: Get a specific score by ID.

  - Middleware: `isLoggedIn`, `userId`
  - Params: `scoreId`
  - Response: Score details.
  - This route retrieves the details of a specific score by its ID.

- **POST** `/scores/submit`: Submit quiz answers and get the score.

  - Middleware: `isLoggedIn`, `userId`
  - Request Body: `quizId`, `answers`
  - Response: Score and result details.
  - This route allows users to submit their answers for a quiz and get the score based on correct answers.

- **DELETE** `/scores/delete-score`: Delete a score.

  - Middleware: `isLoggedIn`, `userId`
  - Request Body: `scoreId`
  - Response: Score deleted.
  - This route allows the quiz owner to delete a specific score from the system.

## Environment Variables

Create a `.env` file in the root of your project directory and add the following variables:

```bash
PORT=<your-server-port>
MONGODB_URL=<your-mongodb-connection-string>
JWT_USER_ACTIVATION_KEY=<your-jwt-user-activation-key>
JWT_USER_ACCESS_KEY=<your-jwt-user-access-key>
JWT_RESET_PASSWORD_KEY=<your-jwt-reset-password-key>
SMTP_USERNAME=<your-smtp-username>
SMTP_PASSWORD=<your-smtp-password>
JWT_QUIZ_SECRET_KEY=<your-jwt-quiz-secret-key>
FRONTEND_URL=<your-frontend-url>
```

Replace each `<value>` with your actual configuration values:

- **PORT**: The port number your server will run on (e.g., 8080).
- **MONGODB_URL**: The connection string for your MongoDB database.
- **JWT_USER_ACTIVATION_KEY**: The secret key for JWT used in user activation.
- **JWT_USER_ACCESS_KEY**: The secret key for JWT used for user authentication.
- **JWT_RESET_PASSWORD_KEY**: The secret key for JWT used in password resets.
- **SMTP_USERNAME**: The username for your SMTP server to send emails.
- **SMTP_PASSWORD**: The password for your SMTP server.
- **JWT_QUIZ_SECRET_KEY**: The secret key for signing quiz-related tokens.
- **FRONTEND_URL**: The URL of your frontend application (e.g., http://localhost:5173 for local development).

## Localization

The project uses **i18next** to support multiple languages. Currently, the supported languages are:

- **English (en)**
- **Arabic (ar)**

Translation files are located in the `src/locales/` directory.

## Technologies Used

- **Node.js**
- **Express**
- **MongoDB**
- **JWT** for authentication
- **i18next** for localization
- **EJS** for email templates
- **Nodemailer** for sending emails

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
