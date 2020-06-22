// @todo Use ResponseObject interface from hapi.
export interface IPartialHapiResponse {
    code(value: number): IPartialHapiResponse;
}
