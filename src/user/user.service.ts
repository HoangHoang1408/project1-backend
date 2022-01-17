import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirebaseService } from './../firebase/firebase.service';
import { UpdateUserInput, UpdateUserOutput } from './dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly firebaseService: FirebaseService,
  ) {}

  async updateUser(
    user: User,
    input: UpdateUserInput,
  ): Promise<UpdateUserOutput> {
    // set image ready to delete
    let imagePathsToDelete: Promise<void>[] = [];
    ['avatarImage', 'backgroundImage'].forEach((property) => {
      if (input[property] && user[property])
        imagePathsToDelete.push(
          this.firebaseService.deleteFile(user[property].imagePath),
        );
    });

    // update user
    Object.entries(input).forEach(([key, value]) => {
      if (value) user[key] = value;
    });
    await this.userRepo.save(user);

    // delete unused image
    if (imagePathsToDelete.length > 0)
      await Promise.allSettled(imagePathsToDelete);

    return {
      ok: true,
    };
  }
}
