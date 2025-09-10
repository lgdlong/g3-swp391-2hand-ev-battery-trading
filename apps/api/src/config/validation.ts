import * as Joi from 'joi';

export interface EnvVars {
  DB_HOST: string;
  DB_PORT: number;
  USERNAME: string;
  PASSWORD: string;
  DB_NAME: string;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const envValidationSchema: Joi.ObjectSchema<EnvVars> =
  Joi.object<EnvVars>({
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(5432),
    USERNAME: Joi.string().required(),
    PASSWORD: Joi.string().min(1).required(),
    DB_NAME: Joi.string().required(),
  });
