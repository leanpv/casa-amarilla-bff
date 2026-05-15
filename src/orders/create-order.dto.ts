import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsNumber, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

class FlavorItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  quantity: number;
}

class OrderItemDto {
  @IsMongoId()
  @IsOptional()
  product?: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlavorItemDto)
  @IsOptional()
  flavors?: FlavorItemDto[];
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @IsString()
  @IsOptional()
  customerEmail?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNumber()
  total: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
