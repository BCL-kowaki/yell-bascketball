/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, TextFieldProps } from "@aws-amplify/ui-react";
export declare type EscapeHatchProps = {
    [elementHierarchy: string]: Record<string, unknown>;
} | null;
export declare type VariantValues = {
    [key: string]: string;
};
export declare type Variant = {
    variantValues: VariantValues;
    overrides: EscapeHatchProps;
};
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type LikeCreateFormInputValues = {
    postId?: string;
    userEmail?: string;
};
export declare type LikeCreateFormValidationValues = {
    postId?: ValidationFunction<string>;
    userEmail?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type LikeCreateFormOverridesProps = {
    LikeCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    postId?: PrimitiveOverrideProps<TextFieldProps>;
    userEmail?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type LikeCreateFormProps = React.PropsWithChildren<{
    overrides?: LikeCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: LikeCreateFormInputValues) => LikeCreateFormInputValues;
    onSuccess?: (fields: LikeCreateFormInputValues) => void;
    onError?: (fields: LikeCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: LikeCreateFormInputValues) => LikeCreateFormInputValues;
    onValidate?: LikeCreateFormValidationValues;
} & React.CSSProperties>;
export default function LikeCreateForm(props: LikeCreateFormProps): React.ReactElement;
