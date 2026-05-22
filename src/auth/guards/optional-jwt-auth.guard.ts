import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT guard that does NOT fail when no token is provided.
 * req.user will be populated if a valid token is present, or undefined otherwise.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    // Ignore missing/invalid token — simply return undefined
    return user ?? undefined;
  }
}
