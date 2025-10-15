import { IsUrl } from "class-validator";

export class CreatePayoDto {
    orderCode!: string;
    amount!: number;
    description!: string;
    @IsUrl()
    cancelUrl!: string;
    @IsUrl()
    returnUrl!: string;
    signature!: string;

    // Thông tin khách hàng
    buyerName?: string;

}
    