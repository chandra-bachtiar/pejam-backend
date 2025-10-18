import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Role, ROLES_KEY } from './roles.decorator'
import { User } from '../user/entities/user.entity'

const ROLE_PRIORITY: Record<Role, number> = {
    user: 0,
    admin: 1,
}

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ])

        if (!requiredRoles || requiredRoles.length === 0) {
            return true
        }

        const request = context.switchToHttp().getRequest<{ user?: Pick<User, 'role'> }>()
        const userRole = request.user?.role as Role | undefined

        if (!userRole) {
            throw new ForbiddenException('You dont have access!')
        }

        const hasAccess = requiredRoles.some((role) => this.hasSufficientRole(userRole, role))

        if (!hasAccess) {
            throw new ForbiddenException('You dont have access!')
        }

        return true
    }

    private hasSufficientRole(userRole: Role, requiredRole: Role): boolean {
        return ROLE_PRIORITY[userRole] >= ROLE_PRIORITY[requiredRole]
    }
}
