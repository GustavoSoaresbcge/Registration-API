import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 409 })
  statusCode: number;

  @ApiProperty({ example: 'Conflict' })
  error: string;

  @ApiProperty({ type: [String], example: ['E-mail já cadastrado'] })
  message: string[];

  @ApiProperty({ example: '/users' })
  path: string;

  @ApiProperty({ example: '2026-11-09T20:11:41.901Z' })
  timestamp: string;
}