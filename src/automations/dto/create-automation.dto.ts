import { IsInt, IsString, IsObject } from 'class-validator'

export class CreateAutomationDto {
  @IsString()
  mediaId: string

  @IsInt()
  accountId: number

  @IsObject()
  action: Record<string, any>
}
