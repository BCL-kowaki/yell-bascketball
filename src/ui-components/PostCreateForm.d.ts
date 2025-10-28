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
export declare type PostCreateFormInputValues = {
    content?: string;
    imageUrl?: string;
    pdfUrl?: string;
    pdfName?: string;
    locationName?: string;
    locationAddress?: string;
    linkUrl?: string;
    linkTitle?: string;
    linkDescription?: string;
    linkImage?: string;
    likesCount?: number;
    commentsCount?: number;
    authorEmail?: string;
    createdAt?: string;
    updatedAt?: string;
};
export declare type PostCreateFormValidationValues = {
    content?: ValidationFunction<string>;
    imageUrl?: ValidationFunction<string>;
    pdfUrl?: ValidationFunction<string>;
    pdfName?: ValidationFunction<string>;
    locationName?: ValidationFunction<string>;
    locationAddress?: ValidationFunction<string>;
    linkUrl?: ValidationFunction<string>;
    linkTitle?: ValidationFunction<string>;
    linkDescription?: ValidationFunction<string>;
    linkImage?: ValidationFunction<string>;
    likesCount?: ValidationFunction<number>;
    commentsCount?: ValidationFunction<number>;
    authorEmail?: ValidationFunction<string>;
    createdAt?: ValidationFunction<string>;
    updatedAt?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type PostCreateFormOverridesProps = {
    PostCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    content?: PrimitiveOverrideProps<TextFieldProps>;
    imageUrl?: PrimitiveOverrideProps<TextFieldProps>;
    pdfUrl?: PrimitiveOverrideProps<TextFieldProps>;
    pdfName?: PrimitiveOverrideProps<TextFieldProps>;
    locationName?: PrimitiveOverrideProps<TextFieldProps>;
    locationAddress?: PrimitiveOverrideProps<TextFieldProps>;
    linkUrl?: PrimitiveOverrideProps<TextFieldProps>;
    linkTitle?: PrimitiveOverrideProps<TextFieldProps>;
    linkDescription?: PrimitiveOverrideProps<TextFieldProps>;
    linkImage?: PrimitiveOverrideProps<TextFieldProps>;
    likesCount?: PrimitiveOverrideProps<TextFieldProps>;
    commentsCount?: PrimitiveOverrideProps<TextFieldProps>;
    authorEmail?: PrimitiveOverrideProps<TextFieldProps>;
    createdAt?: PrimitiveOverrideProps<TextFieldProps>;
    updatedAt?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type PostCreateFormProps = React.PropsWithChildren<{
    overrides?: PostCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: PostCreateFormInputValues) => PostCreateFormInputValues;
    onSuccess?: (fields: PostCreateFormInputValues) => void;
    onError?: (fields: PostCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: PostCreateFormInputValues) => PostCreateFormInputValues;
    onValidate?: PostCreateFormValidationValues;
} & React.CSSProperties>;
export default function PostCreateForm(props: PostCreateFormProps): React.ReactElement;
