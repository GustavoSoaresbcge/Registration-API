import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {
    constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const emailAlreadyExists = await this.usersRepository.existsBy({
      email: dto.email,
    });

    if (emailAlreadyExists) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const user = this.usersRepository.create(dto);
    return this.usersRepository.save(user);
  }
}
