import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BatteryCatalogService } from './battery-catalog.service';
import { ListQueryDto } from '../../../shared/dto/list-query.dto';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { AccountRole } from '../../../shared/enums/account-role.enum';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateBrandDto } from '../shared/dto/create-car-bike-catalog.dto';

@ApiTags('Battery Catalog')
@Controller('battery-catalog')
export class BatteryCatalogController {
  constructor(private readonly service: BatteryCatalogService) {}

  // ======================================================
  // =============== READ (GET) ENDPOINTS =================
  // ======================================================

  /**
   * Lấy danh sách Battery Brand (hãng pin).
   * Hỗ trợ tìm kiếm (q), phân trang (limit, offset), và sắp xếp (order).
   *
   * Example:
   * GET /battery-catalog/brands?q=tesla&limit=50&offset=0&order=ASC
   */
  @Get('brands')
  @ApiOperation({ summary: 'Lấy danh sách Battery Brand (hãng pin)' })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'order', required: false, type: String })
  @ApiOkResponse({ description: 'Danh sách battery brand được trả về' })
  getBrands(@Query() query: ListQueryDto) {
    return this.service.getBrands(query);
  }

  // ======================================================
  // ============== CREATE (POST) ENDPOINTS ===============
  // ======================================================

  /**
   * Tạo mới 1 Battery Brand (hãng pin).
   *
   * Example:
   * POST /battery-catalog/brands
   * Body: { "name": "Tesla" }
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Post('brands')
  @ApiOperation({ summary: 'Tạo Battery Brand mới (cần ADMIN)' })
  @ApiBody({ type: CreateBrandDto })
  @ApiCreatedResponse({ description: 'Battery brand được tạo thành công' })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  createBrand(@Body() dto: CreateBrandDto) {
    return this.service.createBrand(dto);
  }

  // ======================================================
  // ============== DELETE ENDPOINTS ======================
  // ======================================================

  /**
   * Xóa 1 Battery Brand theo ID.
   *
   * Example:
   * DELETE /battery-catalog/brands/1
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Delete('brands/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Xóa Battery Brand (cần ADMIN)' })
  @ApiNoContentResponse({ description: 'Battery brand đã được xóa' })
  deleteBrand(@Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 })) id: number) {
    return this.service.deleteBrand(id);
  }
}
