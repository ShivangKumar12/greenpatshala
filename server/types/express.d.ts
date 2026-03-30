// server/types/express.d.ts
import { User } from '../../shared/schema';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        name: string;
        email: string;
        role: string;
      };
      userId?: number;
    }
  }
}

export type RequestWithUser = Request & {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  userId: number;
};
