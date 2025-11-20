/**
 * Regex kiểm tra số điện thoại Việt Nam
 *
 * Cấu trúc:
 * ^                           - Bắt đầu chuỗi
 * (\+84|84|0)                 - Mã quốc gia/vùng: +84, 84, hoặc 0
 * (3[2-9]|5[25689]|7[06-9]|8[1-689]|9[0-46-9])
 *                             - Mã nhà mạng + chữ số đầu tiên:
 *                               • 3[2-9]: Viettel (32-39)
 *                               • 5[25689]: Vinaphone (52, 55, 56, 58, 59)
 *                               • 7[06-9]: Vietnamobile (70, 76-79)
 *                               • 8[1-689]: Gumi/Gmobile (81, 82, 83, 84, 86, 88, 89)
 *                               • 9[0-46-9]: Mobifone (90, 91, 93, 94, 96-99)
 * [0-9]{7}                    - 7 chữ số còn lại
 * $                           - Kết thúc chuỗi
 *
 * Ví dụ hợp lệ: 0901234567, +84901234567, 84901234567
 */
export const VIETNAMESE_PHONE_REGEX =
  /^(\+84|84|0)(3[2-9]|5[25689]|7[06-9]|8[1-689]|9[0-46-9])[0-9]{7}$/;
