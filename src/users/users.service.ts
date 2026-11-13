import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEventsPublisher } from '../common/events/user-publisher';
import { User } from './user.entity';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly userEventsPublisher: UserEventsPublisher,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const emailAlreadyExists = await this.usersRepository.existsBy({
      email: dto.email,
    });

    if (emailAlreadyExists) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const user = await this.usersRepository.save(
      this.usersRepository.create(dto),
    );

    this.logger.log(`Usuário cadastrado (userId=${user.id})`);

    await this.userEventsPublisher.publishUserCreated(user);
    
    return user;
  }
}
