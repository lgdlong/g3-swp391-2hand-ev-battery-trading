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
import { BikeCatalogService } from './bike-catalog.service';
import { ListQueryDto } from '../../../shared/dto/list-query.dto';
import { CreateBrandDto, CreateModelDto, CreateTrimDto } from './dto/create-bike-catalog.dto';
import { Roles } from '../../../core/decorators/roles.decorator';
import { AccountRole } from '../../../shared/enums/account-role.enum';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/guards/roles.guard';

@Controller('bike-catalog')
export class BikeCatalogController {
  constructor(private readonly service: BikeCatalogService) {}

  // ======================================================
  // =============== READ (GET) ENDPOINTS =================
  // ======================================================

  /**
   * Lấy danh sách Brand (hãng xe máy).
   * Hỗ trợ tìm kiếm (q), phân trang (limit, offset), và sắp xếp (order).
   *
   * Example:
   * GET /bike-catalog/brands?q=tes&limit=50&offset=0&order=ASC
   */
  @Get('brands')
  getBrands(@Query() query: ListQueryDto) {
    return this.service.getBrands(query);
  }

  /**
   * Lấy tất cả Model theo 1 Brand cụ thể.
   * Nếu brandId không tồn tại -> trả 404.
   *
   * Example:
   * GET /bike-catalog/brands/1/models?q=mo&limit=50&offset=0&order=ASC
   */
  @Get('brands/:brandId/models')
  getModelsByBrand(
    @Param('brandId', new ParseIntPipe({ errorHttpStatusCode: 400 })) brandId: number,
    @Query() query: ListQueryDto,
  ) {
    return this.service.getModelsByBrand(brandId, query);
  }

  /**
   * Lấy tất cả Trim theo 1 Model cụ thể.
   * Nếu modelId không tồn tại -> trả 404.
   *
   * Example:
   * GET /bike-catalog/models/10/trims?q=stan&limit=50&offset=0&order=ASC
   */
  @Get('models/:modelId/trims')
  getTrimsByModel(
    @Param('modelId', new ParseIntPipe({ errorHttpStatusCode: 400 })) modelId: number,
    @Query() query: ListQueryDto,
  ) {
    return this.service.getTrimsByModel(modelId, query);
  }

  /**
   * Lấy danh sách Model, có thể filter theo brandId hoặc không.
   * -> brandId là query param tùy chọn.
   *
   * Example:
   * GET /bike-catalog/models?brandId=1&q=mo
   */
  @Get('models')
  getModels(@Query() query: ListQueryDto & { brandId?: number }) {
    // NOTE: Nếu muốn validate brandId (phải là int > 0) -> tạo DTO riêng
    return this.service.getModels(query);
  }

  /**
   * Lấy danh sách Trim, có thể filter theo modelId hoặc không.
   * -> modelId là query param tùy chọn.
   *
   * Example:
   * GET /bike-catalog/trims?modelId=10&q=stan
   */
  @Get('trims')
  getTrims(@Query() query: ListQueryDto & { modelId?: number }) {
    return this.service.getTrims(query);
  }

  // ======================================================
  // ============== CREATE (POST) ENDPOINTS ===============
  // ======================================================

  /**
   * Tạo mới 1 Brand (hãng xe máy).
   *
   * Example:
   * POST /bike-catalog/brands
   * Body: { "name": "Honda" }
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Post('brands')
  createBrand(@Body() dto: CreateBrandDto) {
    return this.service.createBrand(dto);
  }

  /**
   * Tạo mới 1 Model dưới 1 Brand cụ thể (nested).
   * brandId lấy từ path param, name lấy từ body.
   *
   * Example:
   * POST /bike-catalog/brands/2/models
   * Body: { "name": "CBR600RR" }
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Post('brands/:brandId/models')
  createModelUnderBrand(
    @Param('brandId', new ParseIntPipe({ errorHttpStatusCode: 400 })) brandId: number,
    @Body() dto: CreateModelDto,
  ) {
    return this.service.createModel({ ...dto, brandId });
  }

  /**
   * Tạo mới 1 Model (dạng body, không cần nested).
   * brandId được truyền trong body.
   *
   * Example:
   * POST /bike-catalog/models
   * Body: { "name": "Ninja 400", "brandId": 5 }
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Post('models')
  createModel(@Body() dto: CreateModelDto) {
    return this.service.createModel(dto);
  }

  /**
   * Tạo mới 1 Trim dưới 1 Model cụ thể (nested).
   * modelId lấy từ path param, name lấy từ body.
   *
   * Example:
   * POST /bike-catalog/models/10/trims
   * Body: { "name": "ABS" }
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Post('models/:modelId/trims')
  createTrimUnderModel(
    @Param('modelId', new ParseIntPipe({ errorHttpStatusCode: 400 })) modelId: number,
    @Body() dto: CreateTrimDto,
  ) {
    return this.service.createTrim({ ...dto, modelId });
  }

  /**
   * Tạo mới 1 Trim (dạng body, không cần nested).
   * modelId được truyền trong body.
   *
   * Example:
   * POST /bike-catalog/trims
   * Body: { "name": "Standard", "modelId": 10 }
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Post('trims')
  createTrim(@Body() dto: CreateTrimDto) {
    return this.service.createTrim(dto);
  }

  // ======================================================
  // ============== DELETE (DELETE) ENDPOINTS =============
  // ======================================================

  /**
   * Xoá 1 Brand theo id.
   * Nếu brandId không tồn tại -> 404.
   *
   * Example:
   * DELETE /bike-catalog/brands/3
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Delete('brands/:brandId')
  @HttpCode(204)
  deleteBrand(@Param('brandId', new ParseIntPipe({ errorHttpStatusCode: 400 })) brandId: number) {
    return this.service.deleteBrand(brandId);
  }

  /**
   * Xoá 1 Model theo id.
   * Nếu modelId không tồn tại -> 404.
   *
   * Example:
   * DELETE /bike-catalog/models/10
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Delete('models/:modelId')
  @HttpCode(204)
  deleteModel(@Param('modelId', new ParseIntPipe({ errorHttpStatusCode: 400 })) modelId: number) {
    return this.service.deleteModel(modelId);
  }

  /**
   * Xoá 1 Trim theo id.
   * Nếu trimId không tồn tại -> 404.
   *
   * Example:
   * DELETE /bike-catalog/trims/25
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Delete('trims/:trimId')
  @HttpCode(204)
  deleteTrim(@Param('trimId', new ParseIntPipe({ errorHttpStatusCode: 400 })) trimId: number) {
    return this.service.deleteTrim(trimId);
  }
}
