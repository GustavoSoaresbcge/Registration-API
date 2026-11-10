import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @ApiOperation({ summary: 'Cadastra um novo usuário' })
    @ApiCreatedResponse({ description: 'Usuário criado', type: UserResponseDto })
    @ApiBadRequestResponse({
        description: 'Dados inválidos ou campos não permitidos',
        type: ErrorResponseDto,
    }) 
    @ApiConflictResponse({
        description: 'E-mail já cadastrado',
        type: ErrorResponseDto,
    })
    async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
        const user = await this.usersService.create(dto);
        return UserResponseDto.fromEntity(user);
    }
}
