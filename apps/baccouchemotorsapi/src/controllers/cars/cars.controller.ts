import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/entities/user.entity';
import {
  CreateCarDto,
  createCarDtoResponse,
} from 'src/dto/create-car.dto';
import {
  UpdateCarDto,
  updateCarDtoResponse,
} from 'src/dto/update-car.dto';
import { PaginatedResponseDto } from 'src/dto/paginated-response.dto';
import { CarsQueryDto } from 'src/dto/cars-query.dto';
import { Car } from 'src/entities/car.entity';
import { randomUUID } from 'crypto';
import { CarService } from 'src/services/car/car.service';

const multerStorage = diskStorage({
  destination: './uploads/cars',
  filename: (_req, file, cb) => {
    const name = randomUUID();
    cb(null, `${name}${extname(file.originalname) || '.jpg'}`);
  },
});

@Controller('cars')
export class CarsController {
  constructor(private readonly carService: CarService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Paginated list of cars (public). Supports filters: make, model, yearMin, yearMax, priceMin, priceMax, slug',
  })
  async getAllCars(@Query() query: CarsQueryDto): Promise<PaginatedResponseDto<Car>> {
    return this.carService.findAll(query);
  }

  @Get('slug/:slug')
  @ApiResponse({
    status: 200,
    description: 'Car found by slug (public)',
  })
  async getCarBySlug(@Param('slug') slug: string) {
    const car = await this.carService.findBySlug(slug);
    if (!car) {
      return { success: false, message: 'Car not found' };
    }
    return { success: true, car };
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Car found by ID (public)',
  })
  async getCarById(@Param('id') id: string) {
    const car = await this.carService.findById(id);
    if (!car) {
      return { success: false, message: 'Car not found' };
    }
    return { success: true, car };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Car created successfully',
    type: createCarDtoResponse,
  })
  createCar(@Body() carData: CreateCarDto): Promise<createCarDtoResponse> {
    return this.carService.createCar(carData);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Car updated successfully',
    type: updateCarDtoResponse,
  })
  updateCar(
    @Param('id') id: string,
    @Body() carData: UpdateCarDto,
  ): Promise<updateCarDtoResponse> {
    return this.carService.updateCar(id, carData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Car deleted successfully',
  })
  deleteCar(
    @Param('id') id: string,
  ): Promise<{ message: string; success: boolean }> {
    return this.carService.deleteCar(id);
  }

  @Post(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multerStorage,
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|webp|gif)$/i;
        if (allowed.test(file.originalname)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Image uploaded successfully' })
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: { filename: string },
  ) {
    const path = `/uploads/cars/${file.filename}`;
    const car = await this.carService.updateCarImage(id, path);
    return { success: true, car };
  }
}
