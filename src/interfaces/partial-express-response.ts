// @todo Use Response interface from express.
export interface IPartialExpressResponse {
    status(value: number): IPartialExpressResponse;
}
