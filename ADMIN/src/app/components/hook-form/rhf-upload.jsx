import { Controller, useFormContext } from "react-hook-form";

import FormHelperText from "@mui/material/FormHelperText";

import { Upload, UploadAvatar, UploadAvatarCropped } from "../upload";

// ----------------------------------------------------------------------

export function RHFUploadAvatar({ name, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div>
          <UploadAvatar error={!!error} file={field.value} {...other} />

          {!!error && (
            <FormHelperText error sx={{ px: 2, textAlign: "center" }}>
              {error.message}
            </FormHelperText>
          )}
        </div>
      )}
    />
  );
}

export function RHFUploadAvatarCropped({ name, ...other }) {
  const { control, setValue } = useFormContext();
  const handleFileUpload = (croppedImage) => {
    setValue(name, croppedImage, { shouldValidate: true });
  };
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div>
          <UploadAvatarCropped
            error={!!error}
            file={field.value}
            onFileUpload={handleFileUpload}
            {...other}
          />

          {!!error && (
            <FormHelperText error sx={{ px: 2, textAlign: "center" }}>
              {error.message}
            </FormHelperText>
          )}
        </div>
      )}
    />
  );
}

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export function RHFUpload({ name, multiple, isPdf, helperText, ...other }) {
  const { control } = useFormContext();
  const MAX_FILES = 5;
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) =>
        multiple ? (
          <Upload
            multiple
            accept={{
              ".jpg": [],
              ".jpeg": [],
              ".png": []
            }}
            files={field.value}
            onChange={(files) => {
              // Check if the number of files exceeds the maximum allowed
              if (files.length > MAX_FILES) {
                field.onChange(files.slice(0, MAX_FILES)); // Only allow up to 5 files
              } else {
                field.onChange(files); // Update with selected files
              }
            }}
            error={!!error || field.value?.length > MAX_FILES}
            helperText={
              (!!error || field.value?.length > MAX_FILES || helperText) && (
                <FormHelperText error={!!error || field.value?.length > MAX_FILES} sx={{ px: 2 }}>
                  {error
                    ? error?.message
                    : field.value?.length > MAX_FILES
                    ? `You can only upload up to ${MAX_FILES} images.`
                    : helperText}
                </FormHelperText>
              )
            }
            {...other}
          />
        ) : (
          <Upload
            accept={
              isPdf
                ? {
                    ".jpg": [],
                    ".jpeg": [],
                    ".png": [],
                    "application/pdf": []
                  }
                : {
                    ".jpg": [],
                    ".jpeg": [],
                    ".png": []
                  }
            }
            file={field.value}
            error={!!error}
            helperText={
              (!!error || helperText) && (
                <FormHelperText error={!!error} sx={{ px: 2 }}>
                  {error ? error?.message : helperText}
                </FormHelperText>
              )
            }
            {...other}
          />
        )
      }
    />
  );
}
