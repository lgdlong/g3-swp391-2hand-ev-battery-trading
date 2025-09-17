import { Controller, Get, Param, Query, ParseIntPipe, Post, Body } from '@nestjs/common';
import { CarCatalogService } from './car-catalog.service';
import { ListQueryDto } from '../../../shared/dto/list-query.dto';
import { CreateBrandDto, CreateModelDto, CreateTrimDto } from './dto/create-car-catalog.dto';

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
  @Post('brands')
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
   * POST /car-catalog/models
   * Body: { "name": "Model 3", "brandId": 5 }
   */
  @Post('models')
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
   * POST /car-catalog/trims
   * Body: { "name": "RWD", "modelId": 10 }
   */
  @Post('trims')
  createTrim(@Body() dto: CreateTrimDto) {
    return this.service.createTrim(dto);
  }
}
