import { CoreOutput } from 'src/common/dto/output.dto';
export function customError(
  field: string,
  message: string,
): Pick<CoreOutput, 'error' | 'ok'> {
  return {
    ok: false,
    error: {
      message,
      field,
    },
  };
}
