export class PostImageResponseDto {
  id!: string;
  publicId!: string;
  url!: string;
  width!: number;
  height!: number;
  bytes!: number;
  format?: string | null;
  position!: number;
  createdAt!: Date;
}
