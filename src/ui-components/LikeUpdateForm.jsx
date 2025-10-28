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
import { getLike } from "../graphql/queries";
import { updateLike } from "../graphql/mutations";
const client = generateClient();
export default function LikeUpdateForm(props) {
  const {
    id: idProp,
    like: likeModelProp,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    postId: "",
    userEmail: "",
  };
  const [postId, setPostId] = React.useState(initialValues.postId);
  const [userEmail, setUserEmail] = React.useState(initialValues.userEmail);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    const cleanValues = likeRecord
      ? { ...initialValues, ...likeRecord }
      : initialValues;
    setPostId(cleanValues.postId);
    setUserEmail(cleanValues.userEmail);
    setErrors({});
  };
  const [likeRecord, setLikeRecord] = React.useState(likeModelProp);
  React.useEffect(() => {
    const queryData = async () => {
      const record = idProp
        ? (
            await client.graphql({
              query: getLike.replaceAll("__typename", ""),
              variables: { id: idProp },
            })
          )?.data?.getLike
        : likeModelProp;
      setLikeRecord(record);
    };
    queryData();
  }, [idProp, likeModelProp]);
  React.useEffect(resetStateValues, [likeRecord]);
  const validations = {
    postId: [{ type: "Required" }],
    userEmail: [{ type: "Required" }],
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
  return (
    <Grid
      as="form"
      rowGap="15px"
      columnGap="15px"
      padding="20px"
      onSubmit={async (event) => {
        event.preventDefault();
        let modelFields = {
          postId,
          userEmail,
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
            query: updateLike.replaceAll("__typename", ""),
            variables: {
              input: {
                id: likeRecord.id,
                ...modelFields,
              },
            },
          });
          if (onSuccess) {
            onSuccess(modelFields);
          }
        } catch (err) {
          if (onError) {
            const messages = err.errors.map((e) => e.message).join("\n");
            onError(modelFields, messages);
          }
        }
      }}
      {...getOverrideProps(overrides, "LikeUpdateForm")}
      {...rest}
    >
      <TextField
        label="Post id"
        isRequired={true}
        isReadOnly={false}
        value={postId}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              postId: value,
              userEmail,
            };
            const result = onChange(modelFields);
            value = result?.postId ?? value;
          }
          if (errors.postId?.hasError) {
            runValidationTasks("postId", value);
          }
          setPostId(value);
        }}
        onBlur={() => runValidationTasks("postId", postId)}
        errorMessage={errors.postId?.errorMessage}
        hasError={errors.postId?.hasError}
        {...getOverrideProps(overrides, "postId")}
      ></TextField>
      <TextField
        label="User email"
        isRequired={true}
        isReadOnly={false}
        value={userEmail}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              postId,
              userEmail: value,
            };
            const result = onChange(modelFields);
            value = result?.userEmail ?? value;
          }
          if (errors.userEmail?.hasError) {
            runValidationTasks("userEmail", value);
          }
          setUserEmail(value);
        }}
        onBlur={() => runValidationTasks("userEmail", userEmail)}
        errorMessage={errors.userEmail?.errorMessage}
        hasError={errors.userEmail?.hasError}
        {...getOverrideProps(overrides, "userEmail")}
      ></TextField>
      <Flex
        justifyContent="space-between"
        {...getOverrideProps(overrides, "CTAFlex")}
      >
        <Button
          children="Reset"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          isDisabled={!(idProp || likeModelProp)}
          {...getOverrideProps(overrides, "ResetButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={
              !(idProp || likeModelProp) ||
              Object.values(errors).some((e) => e?.hasError)
            }
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
