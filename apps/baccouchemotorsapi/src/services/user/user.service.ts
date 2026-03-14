import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import RegisterDto from 'src/dto/register.dto';
import RegisterResponseDto from 'src/dto/registerresponse.dto';
import { User, UserRole } from 'src/entities/user.entity';
import { LoginResponseDto, LoginUserDto } from 'src/dto/login.dto';
import { PaginatedResponseDto } from 'src/dto/paginated-response.dto';
import { UpdateUserDto } from 'src/dto/update-user.dto';
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private jwt: JwtService
    ) { }

    async register(dto: RegisterDto): Promise<RegisterResponseDto> {
        const existing = await this.userRepository.findOne({
            where: { email: dto.email },
        });
        if (existing) {
            throw new ConflictException('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = this.userRepository.create({
            email: dto.email,
            password: hashedPassword,
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
            role: dto.role ?? UserRole.CUSTOMER,
        });

        const saved = await this.userRepository.save(user);

        return {
            message: 'User registered successfully',
            userId: saved.id,
            success: true,
        };
    }
    async findById(id: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }

    async loginUser(dto: LoginUserDto): Promise<LoginResponseDto> {
        const user = await this.userRepository.findOne({
            where: { email: dto.email },
        });
        if (!user) {
            throw new BadRequestException('Invalid email or password');
        }
        const isMatch = await bcrypt.compare(dto.password, user.password);
        if (!isMatch) {
            throw new BadRequestException('Invalid email or password');
        }

        const payload = { sub: user.id, email: user.email };
        const auth_token = this.jwt.sign(payload);

        const { password: _, ...safeUser } = user;
        return {
            user: safeUser,
            auth_token,
            success: true,
        };
    }
    async findAll(
        page: number = 1,
        limit: number = 10,
    ): Promise<PaginatedResponseDto<Omit<User, 'password'>>> {
        const skip = (page - 1) * limit;
        const [users, total] = await this.userRepository.findAndCount({
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        const safeUsers = users.map(({ password: _, ...user }) => user);
        return new PaginatedResponseDto(safeUsers, total, page, limit);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    async update(id: string, dto: UpdateUserDto): Promise<Omit<User, 'password'>> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        if (dto.firstName !== undefined) user.firstName = dto.firstName;
        if (dto.lastName !== undefined) user.lastName = dto.lastName;
        if (dto.phone !== undefined) user.phone = dto.phone;
        if (dto.address !== undefined) user.address = dto.address;
        const saved = await this.userRepository.save(user);
        const { password: _, ...safeUser } = saved;
        return safeUser;
    }

    async delete(id: string): Promise<void> {
        const result = await this.userRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('User not found');
        }
    }

    async changePassword(
        id: string,
        currentPassword: string,
        newPassword: string,
    ): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new BadRequestException('Current password is incorrect');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.updatePassword(id, hashedPassword);
    }

    async updatePassword(id: string, hashedPassword: string): Promise<void> {
        const result = await this.userRepository.update(id, {
            password: hashedPassword,
        });
        if (result.affected === 0) {
            throw new NotFoundException('User not found');
        }
    }
}
