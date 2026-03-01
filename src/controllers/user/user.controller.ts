import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    Param,
    Post,
    Put,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUserEmailDto } from 'src/dto/get-user-email.dto';
import { LoginResponseDto, LoginUserDto } from 'src/dto/login.dto';
import { PaginatedResponseDto } from 'src/dto/paginated-response.dto';
import { PaginationDto } from 'src/dto/pagination.dto';
import RegisterDto from 'src/dto/register.dto';
import RegisterResponseDto from 'src/dto/registerresponse.dto';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import { User, UserRole } from 'src/entities/user.entity';
import { UserService } from 'src/services/user/user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('register')
    @ApiResponse({
        status: 201,
        description: 'User registered successfully',
        type: RegisterResponseDto,
    })
    registerUser(@Body() userData: RegisterDto): Promise<RegisterResponseDto> {
        return this.userService.register(userData);
    }

    @Post('login')
    @ApiResponse({
        status: 201,
        description: 'User logged in',
        type: LoginResponseDto,
    })
    loginUser(@Body() loginData: LoginUserDto): Promise<LoginResponseDto> {
        return this.userService.loginUser(loginData);
    }

    @Get('all')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Paginated list of users' })
    async getAllUsers(
        @Query() pagination: PaginationDto,
    ): Promise<PaginatedResponseDto<Omit<User, 'password'>>> {
        const page = pagination.page ?? 1;
        const limit = pagination.limit ?? 10;
        return this.userService.findAll(page, limit);
    }

    @Get('email')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'User found by email' })
    async getUserByEmail(@Query() dto: GetUserEmailDto) {
        const user = await this.userService.findByEmail(dto.email);
        if (!user) {
            return { success: false, message: 'User not found' };
        }
        const { password: _, ...safeUser } = user;
        return { success: true, user: safeUser };
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'User found by ID' })
    async getUserById(@Param('id') id: string) {
        const user = await this.userService.findById(id);
        if (!user) {
            return { success: false, message: 'User not found' };
        }
        const { password: _, ...safeUser } = user;
        return { success: true, user: safeUser };
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Profile updated' })
    async updateProfile(
        @Param('id') id: string,
        @Body() dto: UpdateUserDto,
        @Req() req: Request & { user: User },
    ) {
        this.assertCanModifyUser(req.user, id);
        return this.userService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'User deleted' })
    async deleteUser(
        @Param('id') id: string,
        @Req() req: Request & { user: User },
    ) {
        this.assertCanModifyUser(req.user, id);
        await this.userService.delete(id);
        return { success: true, message: 'User deleted' };
    }

    private assertCanModifyUser(currentUser: User, targetId: string): void {
        const isSelf = currentUser.id === targetId;
        const isAdmin = currentUser.role === UserRole.ADMIN;
        if (!isSelf && !isAdmin) {
            throw new ForbiddenException(
                'You can only modify your own profile unless you are an admin',
            );
        }
    }
}
