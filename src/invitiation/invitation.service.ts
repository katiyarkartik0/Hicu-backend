import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { InvitationModel, InvitationStatus } from './invitation.schema';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { UsersService } from 'src/user/user.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class InvitationService {
  constructor(private usersService: UsersService) {}

  private scheduleUpdates({
    invitation,
    updateInvitationDto,
  }: {
    invitation: any;
    updateInvitationDto: UpdateInvitationDto;
  }): Array<Promise<any>> {
    const { recipientEmail, senderEmail, id, scope } = invitation;
    const { status } = updateInvitationDto;
    const { ACCEPTED, DECLINED } = InvitationStatus;
    if (status === DECLINED) {
      return [
        InvitationModel.update({ email: senderEmail, id }, updateInvitationDto),
        InvitationModel.update(
          { email: recipientEmail, id },
          updateInvitationDto,
        ),
      ];
    } else if (status === ACCEPTED) {
      return [
        InvitationModel.update({ email: senderEmail, id }, updateInvitationDto),
        InvitationModel.update(
          { email: recipientEmail, id },
          updateInvitationDto,
        ),
        this.usersService.addNewScope(recipientEmail, scope),
      ];
    }
    return [];
  }

  async create(createInvitationDto: CreateInvitationDto) {
    const { recipientEmail, senderEmail } = createInvitationDto;

    if (recipientEmail === senderEmail) {
      throw new BadRequestException('Sender and recipient cannot be the same');
    }
    const id = uuid();
    await Promise.all([
      InvitationModel.create({
        email: recipientEmail,
        id,
        ...createInvitationDto,
      }),
      InvitationModel.create({
        email: senderEmail,
        id,
        ...createInvitationDto,
      }),
    ]);
  }

  findAll() {
    return `This action returns all invitation`;
  }

  async findOne(id: string, userEmail: string) {
    return await InvitationModel.get({ email: userEmail, id });
  }

  async update(
    userEmail: string,
    id: string,
    updateInvitationDto: UpdateInvitationDto,
  ) {
    try {
      const invitation = await InvitationModel.get({ email: userEmail, id });

      if (!invitation) {
        throw new NotFoundException('Invitation not found');
      }

      const updates = {
        ...updateInvitationDto,
        updatedAt: new Date().toISOString(),
      };

      const scheduledUpdates = this.scheduleUpdates({
        invitation,
        updateInvitationDto,
      });

      await Promise.all(scheduledUpdates);

      return {
        message:
          'Invitation updated for both sender and recipient and new scope added to recipient',
      };
    } catch (error) {
      console.error('Error updating invitation:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update invitation');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} invitation`;
  }
}
