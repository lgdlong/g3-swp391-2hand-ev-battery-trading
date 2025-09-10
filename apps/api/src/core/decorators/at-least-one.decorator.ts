// apps/api/src/core/decorators/at-least-one.decorator.ts
import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function AtLeastOne(fields: string[], options?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [fields],
      validator: {
        validate(_value: any, args: ValidationArguments) {
          const [props] = args.constraints as [string[]];
          const obj = args.object as Record<string, any>;
          // hợp lệ nếu ít nhất 1 field trong list có giá trị khác null/undefined/empty
          return props.some((f) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const v = obj[f];
            return v !== undefined && v !== null && String(v).trim() !== '';
          });
        },
        defaultMessage(args: ValidationArguments) {
          const [props] = args.constraints as [string[]];
          return `Either ${props.join(' or ')} must be provided`;
        },
      },
    });
  };
}
