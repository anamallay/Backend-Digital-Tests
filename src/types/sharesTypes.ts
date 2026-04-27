import { JwtPayload } from 'jsonwebtoken'

// Payload signed by `shareQuizWithUser` and verified by
// `addQuizToLibraryUsingToken`. Defines the exact set of fields
// embedded in the share JWT so the verify-side cast is type-safe and
// the controller can't accidentally read a field that wasn't signed.
//
// Keep in lockstep with the `jwt.sign({ ... })` call in librariesController.
export interface QuizShareTokenPayload extends JwtPayload {
  quizId: string
  sharedByUserId: string
}
