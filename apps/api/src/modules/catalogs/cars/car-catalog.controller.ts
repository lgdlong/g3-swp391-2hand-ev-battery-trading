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
import { CarCatalogService } from './car-catalog.service';
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
} from '@nestjs/swagger';
import {
  CreateBrandDto,
  CreateModelDto,
  CreateTrimDto,
} from '../shared/dto/create-car-bike-catalog.dto';

@Controller('car-catalog')
export class CarCatalogController {
  constructor(private readonly service: CarCatalogService) {}

  // ======================================================
  // =============== READ (GET) ENDPOINTS =================
  // ======================================================

  /**
   * Lấy danh sách Brand (hãng xe).
   * Hỗ trợ tìm kiếm (q), phân trang (limit, offset), và sắp xếp (order).
   *
   * Example:
   * GET /car-catalog/brands?q=tes&limit=50&offset=0&order=ASC
   */
  @Get('brands')
  @ApiOperation({ summary: 'Lấy danh sách Brand (hãng xe hơi)' })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'order', required: false, type: String })
  @ApiOkResponse({ description: 'Danh sách brand được trả về' })
  getBrands(@Query() query: ListQueryDto) {
    return this.service.getBrands(query);
  }

  /**
   * Lấy tất cả Model theo 1 Brand cụ thể.
   * Nếu brandId không tồn tại -> trả 404.
   *
   * Example:
   * GET /car-catalog/brands/1/models?q=mo&limit=50&offset=0&order=ASC
   */
  @Get('brands/:brandId/models')
  @ApiOperation({ summary: 'Lấy danh sách Model theo Brand' })
  @ApiOkResponse({ description: 'Danh sách model theo brand' })
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
   * GET /car-catalog/models/10/trims?q=stan&limit=50&offset=0&order=ASC
   */
  @Get('models/:modelId/trims')
  @ApiOperation({ summary: 'Lấy danh sách Trim theo Model' })
  @ApiOkResponse({ description: 'Danh sách trim theo model' })
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
   * GET /car-catalog/models?brandId=1&q=mo
   */
  @Get('models')
  @ApiOperation({ summary: 'Lấy danh sách Model (có thể filter theo brandId)' })
  @ApiOkResponse({ description: 'Danh sách model' })
  getModels(@Query() query: ListQueryDto & { brandId?: number }) {
    // NOTE: Nếu muốn validate brandId (phải là int > 0) -> tạo DTO riêng
    return this.service.getModels(query);
  }

  /**
   * Lấy danh sách Trim, có thể filter theo modelId hoặc không.
   * -> modelId là query param tùy chọn.
   *
   * Example:
   * GET /car-catalog/trims?modelId=10&q=stan
   */
  @Get('trims')
  @ApiOperation({ summary: 'Lấy danh sách Trim (có thể filter theo modelId)' })
  @ApiOkResponse({ description: 'Danh sách trim' })
  getTrims(@Query() query: ListQueryDto & { modelId?: number }) {
    return this.service.getTrims(query);
  }

  // ======================================================
  // ============== CREATE (POST) ENDPOINTS ===============
  // ======================================================

  /**
   * Tạo mới 1 Brand (hãng xe).
   *
   * Example:
   * POST /car-catalog/brands
   * Body: { "name": "VinFast" }
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Post('brands')
  @ApiOperation({ summary: 'Tạo Brand mới (cần ADMIN)' })
  @ApiBody({ type: CreateBrandDto })
  @ApiCreatedResponse({ description: 'Brand được tạo thành công' })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  createBrand(@Body() dto: CreateBrandDto) {
    return this.service.createBrand(dto);
  }

  /**
   * Tạo mới 1 Model dưới 1 Brand cụ thể (nested).
   * brandId lấy từ path param, name lấy từ body.
   *
   * Example:
   * POST /car-catalog/brands/2/models
   * Body: { "name": "VF 8" }
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Post('brands/:brandId/models')
  @ApiOperation({ summary: 'Tạo Model mới theo Brand (cần ADMIN)' })
  @ApiBody({ type: CreateModelDto })
  @ApiCreatedResponse({ description: 'Model được tạo thành công' })
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
   * POST /car-catalog/models
   * Body: { "name": "Model 3", "brandId": 5 }
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Post('models')
  @ApiOperation({ summary: 'Tạo Model mới (cần ADMIN)' })
  @ApiBody({ type: CreateModelDto })
  @ApiCreatedResponse({ description: 'Model được tạo thành công' })
  createModel(@Body() dto: CreateModelDto) {
    return this.service.createModel(dto);
  }

  /**
   * Tạo mới 1 Trim dưới 1 Model cụ thể (nested).
   * modelId lấy từ path param, name lấy từ body.
   *
   * Example:
   * POST /car-catalog/models/10/trims
   * Body: { "name": "Long Range" }
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Post('models/:modelId/trims')
  @ApiOperation({ summary: 'Tạo Trim mới theo Model (cần ADMIN)' })
  @ApiBody({ type: CreateTrimDto })
  @ApiCreatedResponse({ description: 'Trim được tạo thành công' })
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
   * POST /car-catalog/trims
   * Body: { "name": "RWD", "modelId": 10 }
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Post('trims')
  @ApiOperation({ summary: 'Tạo Trim mới (cần ADMIN)' })
  @ApiBody({ type: CreateTrimDto })
  @ApiCreatedResponse({ description: 'Trim được tạo thành công' })
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
   * DELETE /car-catalog/brands/3
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Delete('brands/:brandId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Xoá Brand (cần ADMIN)' })
  @ApiNoContentResponse({ description: 'Xoá thành công' })
  deleteBrand(@Param('brandId', new ParseIntPipe({ errorHttpStatusCode: 400 })) brandId: number) {
    return this.service.deleteBrand(brandId);
  }

  /**
   * Xoá 1 Model theo id.
   * Nếu modelId không tồn tại -> 404.
   *
   * Example:
   * DELETE /car-catalog/models/10
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Delete('models/:modelId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Xoá Model (cần ADMIN)' })
  @ApiNoContentResponse({ description: 'Xoá thành công' })
  deleteModel(@Param('modelId', new ParseIntPipe({ errorHttpStatusCode: 400 })) modelId: number) {
    return this.service.deleteModel(modelId);
  }

  /**
   * Xoá 1 Trim theo id.
   * Nếu trimId không tồn tại -> 404.
   *
   * Example:
   * DELETE /car-catalog/trims/5
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Delete('trims/:trimId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Xoá Trim (cần ADMIN)' })
  @ApiNoContentResponse({ description: 'Xoá thành công' })
  deleteTrim(@Param('trimId', new ParseIntPipe({ errorHttpStatusCode: 400 })) trimId: number) {
    return this.service.deleteTrim(trimId);
  }
}
