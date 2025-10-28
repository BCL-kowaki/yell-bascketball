/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import { Button, Flex, Grid, TextField } from "@aws-amplify/ui-react";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { generateClient } from "aws-amplify/api";
import { createPost } from "../graphql/mutations";
const client = generateClient();
export default function PostCreateForm(props) {
  const {
    clearOnSuccess = true,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    content: "",
    imageUrl: "",
    pdfUrl: "",
    pdfName: "",
    locationName: "",
    locationAddress: "",
    linkUrl: "",
    linkTitle: "",
    linkDescription: "",
    linkImage: "",
    likesCount: "",
    commentsCount: "",
    authorEmail: "",
    createdAt: "",
    updatedAt: "",
  };
  const [content, setContent] = React.useState(initialValues.content);
  const [imageUrl, setImageUrl] = React.useState(initialValues.imageUrl);
  const [pdfUrl, setPdfUrl] = React.useState(initialValues.pdfUrl);
  const [pdfName, setPdfName] = React.useState(initialValues.pdfName);
  const [locationName, setLocationName] = React.useState(
    initialValues.locationName
  );
  const [locationAddress, setLocationAddress] = React.useState(
    initialValues.locationAddress
  );
  const [linkUrl, setLinkUrl] = React.useState(initialValues.linkUrl);
  const [linkTitle, setLinkTitle] = React.useState(initialValues.linkTitle);
  const [linkDescription, setLinkDescription] = React.useState(
    initialValues.linkDescription
  );
  const [linkImage, setLinkImage] = React.useState(initialValues.linkImage);
  const [likesCount, setLikesCount] = React.useState(initialValues.likesCount);
  const [commentsCount, setCommentsCount] = React.useState(
    initialValues.commentsCount
  );
  const [authorEmail, setAuthorEmail] = React.useState(
    initialValues.authorEmail
  );
  const [createdAt, setCreatedAt] = React.useState(initialValues.createdAt);
  const [updatedAt, setUpdatedAt] = React.useState(initialValues.updatedAt);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    setContent(initialValues.content);
    setImageUrl(initialValues.imageUrl);
    setPdfUrl(initialValues.pdfUrl);
    setPdfName(initialValues.pdfName);
    setLocationName(initialValues.locationName);
    setLocationAddress(initialValues.locationAddress);
    setLinkUrl(initialValues.linkUrl);
    setLinkTitle(initialValues.linkTitle);
    setLinkDescription(initialValues.linkDescription);
    setLinkImage(initialValues.linkImage);
    setLikesCount(initialValues.likesCount);
    setCommentsCount(initialValues.commentsCount);
    setAuthorEmail(initialValues.authorEmail);
    setCreatedAt(initialValues.createdAt);
    setUpdatedAt(initialValues.updatedAt);
    setErrors({});
  };
  const validations = {
    content: [{ type: "Required" }],
    imageUrl: [],
    pdfUrl: [],
    pdfName: [],
    locationName: [],
    locationAddress: [],
    linkUrl: [],
    linkTitle: [],
    linkDescription: [],
    linkImage: [],
    likesCount: [{ type: "Required" }],
    commentsCount: [{ type: "Required" }],
    authorEmail: [],
    createdAt: [],
    updatedAt: [],
  };
  const runValidationTasks = async (
    fieldName,
    currentValue,
    getDisplayValue
  ) => {
    const value =
      currentValue && getDisplayValue
        ? getDisplayValue(currentValue)
        : currentValue;
    let validationResponse = validateField(value, validations[fieldName]);
    const customValidator = fetchByPath(onValidate, fieldName);
    if (customValidator) {
      validationResponse = await customValidator(value, validationResponse);
    }
    setErrors((errors) => ({ ...errors, [fieldName]: validationResponse }));
    return validationResponse;
  };
  const convertToLocal = (date) => {
    const df = new Intl.DateTimeFormat("default", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      calendar: "iso8601",
      numberingSystem: "latn",
      hourCycle: "h23",
    });
    const parts = df.formatToParts(date).reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
  };
  return (
    <Grid
      as="form"
      rowGap="15px"
      columnGap="15px"
      padding="20px"
      onSubmit={async (event) => {
        event.preventDefault();
        let modelFields = {
          content,
          imageUrl,
          pdfUrl,
          pdfName,
          locationName,
          locationAddress,
          linkUrl,
          linkTitle,
          linkDescription,
          linkImage,
          likesCount,
          commentsCount,
          authorEmail,
          createdAt,
          updatedAt,
        };
        const validationResponses = await Promise.all(
          Object.keys(validations).reduce((promises, fieldName) => {
            if (Array.isArray(modelFields[fieldName])) {
              promises.push(
                ...modelFields[fieldName].map((item) =>
                  runValidationTasks(fieldName, item)
                )
              );
              return promises;
            }
            promises.push(
              runValidationTasks(fieldName, modelFields[fieldName])
            );
            return promises;
          }, [])
        );
        if (validationResponses.some((r) => r.hasError)) {
          return;
        }
        if (onSubmit) {
          modelFields = onSubmit(modelFields);
        }
        try {
          Object.entries(modelFields).forEach(([key, value]) => {
            if (typeof value === "string" && value === "") {
              modelFields[key] = null;
            }
          });
          await client.graphql({
            query: createPost.replaceAll("__typename", ""),
            variables: {
              input: {
                ...modelFields,
              },
            },
          });
          if (onSuccess) {
            onSuccess(modelFields);
          }
          if (clearOnSuccess) {
            resetStateValues();
          }
        } catch (err) {
          if (onError) {
            const messages = err.errors.map((e) => e.message).join("\n");
            onError(modelFields, messages);
          }
        }
      }}
      {...getOverrideProps(overrides, "PostCreateForm")}
      {...rest}
    >
      <TextField
        label="Content"
        isRequired={true}
        isReadOnly={false}
        value={content}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              content: value,
              imageUrl,
              pdfUrl,
              pdfName,
              locationName,
              locationAddress,
              linkUrl,
              linkTitle,
              linkDescription,
              linkImage,
              likesCount,
              commentsCount,
              authorEmail,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.content ?? value;
          }
          if (errors.content?.hasError) {
            runValidationTasks("content", value);
          }
          setContent(value);
        }}
        onBlur={() => runValidationTasks("content", content)}
        errorMessage={errors.content?.errorMessage}
        hasError={errors.content?.hasError}
        {...getOverrideProps(overrides, "content")}
      ></TextField>
      <TextField
        label="Image url"
        isRequired={false}
        isReadOnly={false}
        value={imageUrl}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              content,
              imageUrl: value,
              pdfUrl,
              pdfName,
              locationName,
              locationAddress,
              linkUrl,
              linkTitle,
              linkDescription,
              linkImage,
              likesCount,
              commentsCount,
              authorEmail,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.imageUrl ?? value;
          }
          if (errors.imageUrl?.hasError) {
            runValidationTasks("imageUrl", value);
          }
          setImageUrl(value);
        }}
        onBlur={() => runValidationTasks("imageUrl", imageUrl)}
        errorMessage={errors.imageUrl?.errorMessage}
        hasError={errors.imageUrl?.hasError}
        {...getOverrideProps(overrides, "imageUrl")}
      ></TextField>
      <TextField
        label="Pdf url"
        isRequired={false}
        isReadOnly={false}
        value={pdfUrl}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              content,
              imageUrl,
              pdfUrl: value,
              pdfName,
              locationName,
              locationAddress,
              linkUrl,
              linkTitle,
              linkDescription,
              linkImage,
              likesCount,
              commentsCount,
              authorEmail,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.pdfUrl ?? value;
          }
          if (errors.pdfUrl?.hasError) {
            runValidationTasks("pdfUrl", value);
          }
          setPdfUrl(value);
        }}
        onBlur={() => runValidationTasks("pdfUrl", pdfUrl)}
        errorMessage={errors.pdfUrl?.errorMessage}
        hasError={errors.pdfUrl?.hasError}
        {...getOverrideProps(overrides, "pdfUrl")}
      ></TextField>
      <TextField
        label="Pdf name"
        isRequired={false}
        isReadOnly={false}
        value={pdfName}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              content,
              imageUrl,
              pdfUrl,
              pdfName: value,
              locationName,
              locationAddress,
              linkUrl,
              linkTitle,
              linkDescription,
              linkImage,
              likesCount,
              commentsCount,
              authorEmail,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.pdfName ?? value;
          }
          if (errors.pdfName?.hasError) {
            runValidationTasks("pdfName", value);
          }
          setPdfName(value);
        }}
        onBlur={() => runValidationTasks("pdfName", pdfName)}
        errorMessage={errors.pdfName?.errorMessage}
        hasError={errors.pdfName?.hasError}
        {...getOverrideProps(overrides, "pdfName")}
      ></TextField>
      <TextField
        label="Location name"
        isRequired={false}
        isReadOnly={false}
        value={locationName}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              content,
              imageUrl,
              pdfUrl,
              pdfName,
              locationName: value,
              locationAddress,
              linkUrl,
              linkTitle,
              linkDescription,
              linkImage,
              likesCount,
              commentsCount,
              authorEmail,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.locationName ?? value;
          }
          if (errors.locationName?.hasError) {
            runValidationTasks("locationName", value);
          }
          setLocationName(value);
        }}
        onBlur={() => runValidationTasks("locationName", locationName)}
        errorMessage={errors.locationName?.errorMessage}
        hasError={errors.locationName?.hasError}
        {...getOverrideProps(overrides, "locationName")}
      ></TextField>
      <TextField
        label="Location address"
        isRequired={false}
        isReadOnly={false}
        value={locationAddress}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              content,
              imageUrl,
              pdfUrl,
              pdfName,
              locationName,
              locationAddress: value,
              linkUrl,
              linkTitle,
              linkDescription,
              linkImage,
              likesCount,
              commentsCount,
              authorEmail,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.locationAddress ?? value;
          }
          if (errors.locationAddress?.hasError) {
            runValidationTasks("locationAddress", value);
          }
          setLocationAddress(value);
        }}
        onBlur={() => runValidationTasks("locationAddress", locationAddress)}
        errorMessage={errors.locationAddress?.errorMessage}
        hasError={errors.locationAddress?.hasError}
        {...getOverrideProps(overrides, "locationAddress")}
      ></TextField>
      <TextField
        label="Link url"
        isRequired={false}
        isReadOnly={false}
        value={linkUrl}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              content,
              imageUrl,
              pdfUrl,
              pdfName,
              locationName,
              locationAddress,
              linkUrl: value,
              linkTitle,
              linkDescription,
              linkImage,
              likesCount,
              commentsCount,
              authorEmail,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.linkUrl ?? value;
          }
          if (errors.linkUrl?.hasError) {
            runValidationTasks("linkUrl", value);
          }
          setLinkUrl(value);
        }}
        onBlur={() => runValidationTasks("linkUrl", linkUrl)}
        errorMessage={errors.linkUrl?.errorMessage}
        hasError={errors.linkUrl?.hasError}
        {...getOverrideProps(overrides, "linkUrl")}
      ></TextField>
      <TextField
        label="Link title"
        isRequired={false}
        isReadOnly={false}
        value={linkTitle}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              content,
              imageUrl,
              pdfUrl,
              pdfName,
              locationName,
              locationAddress,
              linkUrl,
              linkTitle: value,
              linkDescription,
              linkImage,
              likesCount,
              commentsCount,
              authorEmail,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.linkTitle ?? value;
          }
          if (errors.linkTitle?.hasError) {
            runValidationTasks("linkTitle", value);
          }
          setLinkTitle(value);
        }}
        onBlur={() => runValidationTasks("linkTitle", linkTitle)}
        errorMessage={errors.linkTitle?.errorMessage}
        hasError={errors.linkTitle?.hasError}
        {...getOverrideProps(overrides, "linkTitle")}
      ></TextField>
      <TextField
        label="Link description"
        isRequired={false}
        isReadOnly={false}
        value={linkDescription}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              content,
              imageUrl,
              pdfUrl,
              pdfName,
              locationName,
              locationAddress,
              linkUrl,
              linkTitle,
              linkDescription: value,
              linkImage,
              likesCount,
              commentsCount,
              authorEmail,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.linkDescription ?? value;
          }
          if (errors.linkDescription?.hasError) {
            runValidationTasks("linkDescription", value);
          }
          setLinkDescription(value);
        }}
        onBlur={() => runValidationTasks("linkDescription", linkDescription)}
        errorMessage={errors.linkDescription?.errorMessage}
        hasError={errors.linkDescription?.hasError}
        {...getOverrideProps(overrides, "linkDescription")}
      ></TextField>
      <TextField
        label="Link image"
        isRequired={false}
        isReadOnly={false}
        value={linkImage}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              content,
              imageUrl,
              pdfUrl,
              pdfName,
              locationName,
              locationAddress,
              linkUrl,
              linkTitle,
              linkDescription,
              linkImage: value,
              likesCount,
              commentsCount,
              authorEmail,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.linkImage ?? value;
          }
          if (errors.linkImage?.hasError) {
            runValidationTasks("linkImage", value);
          }
          setLinkImage(value);
        }}
        onBlur={() => runValidationTasks("linkImage", linkImage)}
        errorMessage={errors.linkImage?.errorMessage}
        hasError={errors.linkImage?.hasError}
        {...getOverrideProps(overrides, "linkImage")}
      ></TextField>
      <TextField
        label="Likes count"
        isRequired={true}
        isReadOnly={false}
        type="number"
        step="any"
        value={likesCount}
        onChange={(e) => {
          let value = isNaN(parseInt(e.target.value))
            ? e.target.value
            : parseInt(e.target.value);
          if (onChange) {
            const modelFields = {
              content,
              imageUrl,
              pdfUrl,
              pdfName,
              locationName,
              locationAddress,
              linkUrl,
              linkTitle,
              linkDescription,
              linkImage,
              likesCount: value,
              commentsCount,
              authorEmail,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.likesCount ?? value;
          }
          if (errors.likesCount?.hasError) {
            runValidationTasks("likesCount", value);
          }
          setLikesCount(value);
        }}
        onBlur={() => runValidationTasks("likesCount", likesCount)}
        errorMessage={errors.likesCount?.errorMessage}
        hasError={errors.likesCount?.hasError}
        {...getOverrideProps(overrides, "likesCount")}
      ></TextField>
      <TextField
        label="Comments count"
        isRequired={true}
        isReadOnly={false}
        type="number"
        step="any"
        value={commentsCount}
        onChange={(e) => {
          let value = isNaN(parseInt(e.target.value))
            ? e.target.value
            : parseInt(e.target.value);
          if (onChange) {
            const modelFields = {
              content,
              imageUrl,
              pdfUrl,
              pdfName,
              locationName,
              locationAddress,
              linkUrl,
              linkTitle,
              linkDescription,
              linkImage,
              likesCount,
              commentsCount: value,
              authorEmail,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.commentsCount ?? value;
          }
          if (errors.commentsCount?.hasError) {
            runValidationTasks("commentsCount", value);
          }
          setCommentsCount(value);
        }}
        onBlur={() => runValidationTasks("commentsCount", commentsCount)}
        errorMessage={errors.commentsCount?.errorMessage}
        hasError={errors.commentsCount?.hasError}
        {...getOverrideProps(overrides, "commentsCount")}
      ></TextField>
      <TextField
        label="Author email"
        isRequired={false}
        isReadOnly={false}
        value={authorEmail}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              content,
              imageUrl,
              pdfUrl,
              pdfName,
              locationName,
              locationAddress,
              linkUrl,
              linkTitle,
              linkDescription,
              linkImage,
              likesCount,
              commentsCount,
              authorEmail: value,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.authorEmail ?? value;
          }
          if (errors.authorEmail?.hasError) {
            runValidationTasks("authorEmail", value);
          }
          setAuthorEmail(value);
        }}
        onBlur={() => runValidationTasks("authorEmail", authorEmail)}
        errorMessage={errors.authorEmail?.errorMessage}
        hasError={errors.authorEmail?.hasError}
        {...getOverrideProps(overrides, "authorEmail")}
      ></TextField>
      <TextField
        label="Created at"
        isRequired={false}
        isReadOnly={false}
        type="datetime-local"
        value={createdAt && convertToLocal(new Date(createdAt))}
        onChange={(e) => {
          let value =
            e.target.value === "" ? "" : new Date(e.target.value).toISOString();
          if (onChange) {
            const modelFields = {
              content,
              imageUrl,
              pdfUrl,
              pdfName,
              locationName,
              locationAddress,
              linkUrl,
              linkTitle,
              linkDescription,
              linkImage,
              likesCount,
              commentsCount,
              authorEmail,
              createdAt: value,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.createdAt ?? value;
          }
          if (errors.createdAt?.hasError) {
            runValidationTasks("createdAt", value);
          }
          setCreatedAt(value);
        }}
        onBlur={() => runValidationTasks("createdAt", createdAt)}
        errorMessage={errors.createdAt?.errorMessage}
        hasError={errors.createdAt?.hasError}
        {...getOverrideProps(overrides, "createdAt")}
      ></TextField>
      <TextField
        label="Updated at"
        isRequired={false}
        isReadOnly={false}
        type="datetime-local"
        value={updatedAt && convertToLocal(new Date(updatedAt))}
        onChange={(e) => {
          let value =
            e.target.value === "" ? "" : new Date(e.target.value).toISOString();
          if (onChange) {
            const modelFields = {
              content,
              imageUrl,
              pdfUrl,
              pdfName,
              locationName,
              locationAddress,
              linkUrl,
              linkTitle,
              linkDescription,
              linkImage,
              likesCount,
              commentsCount,
              authorEmail,
              createdAt,
              updatedAt: value,
            };
            const result = onChange(modelFields);
            value = result?.updatedAt ?? value;
          }
          if (errors.updatedAt?.hasError) {
            runValidationTasks("updatedAt", value);
          }
          setUpdatedAt(value);
        }}
        onBlur={() => runValidationTasks("updatedAt", updatedAt)}
        errorMessage={errors.updatedAt?.errorMessage}
        hasError={errors.updatedAt?.hasError}
        {...getOverrideProps(overrides, "updatedAt")}
      ></TextField>
      <Flex
        justifyContent="space-between"
        {...getOverrideProps(overrides, "CTAFlex")}
      >
        <Button
          children="Clear"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          {...getOverrideProps(overrides, "ClearButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={Object.values(errors).some((e) => e?.hasError)}
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
