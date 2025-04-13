import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AnyItem } from 'dynamoose/dist/Item';
import { User } from './user.types';
import { UserModel } from './user.schema';

@Injectable()
export class UsersService {
  async findById(userId: string): Promise<AnyItem | null> {
    return await UserModel.get(userId);
  }

  async findByEmail(email: string): Promise<AnyItem | null> {
    const results = await UserModel.query('email').eq(email).exec();
    return results[0] || null;
  }

  async create({ email, password }: User): Promise<AnyItem> {
    return await UserModel.create({ email, password });
  }

  async addNewScope(email: string, newScopes: Array<string>): Promise<AnyItem> {
    try {
      const user = await UserModel.get(email);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.scope = Array.from(new Set([...(user.scope || []), ...newScopes]));

      await user.save();

      return user;
    } catch (error) {
      console.error('Error saving updated user:', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update user scopes');
    }
  }
}
