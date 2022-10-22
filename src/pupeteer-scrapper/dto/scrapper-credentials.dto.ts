import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ReportTypes } from '../enum/report-types.enum';

export class ScrapperCredentials {
  @ApiProperty({ example: 'lalachka' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'Dfdfdfdf11#' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'Natalie Rynda' })
  @IsNotEmpty()
  userNameClickLink: string;

  @ApiProperty({ example: [ReportTypes.CLIENT_APPOINTMENTS] })
  @IsEnum(ReportTypes, { each: true })
  @IsOptional()
  reports?: string[];
}
